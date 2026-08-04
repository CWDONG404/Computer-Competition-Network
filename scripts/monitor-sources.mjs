import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
const hostLastRequest = new Map();
const HOST_GAP_MS = 2_000;
const REQUEST_TIMEOUT_MS = 18_000;

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function normalizeContent(content, contentType) {
  if (contentType.includes("html")) {
    return content
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--([\s\S]*?)-->/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;|&#160;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">");
  }
  return content.replace(/\s+/g, " ").trim();
}

function hashContent(content) {
  return createHash("sha256").update(content).digest("hex");
}

function nextIntervalDays(source) {
  if (source.kind === "certification") return 30;
  if (source.kind === "platform") return 7;
  const nearest = source.registration_end || source.event_start;
  if (source.status === "open" || source.status === "upcoming") return 1;
  if (nearest) {
    const days = (new Date(nearest).getTime() - Date.now()) / 86_400_000;
    if (days >= 0 && days <= 90) return 1;
  }
  return 7;
}

async function respectHostGap(url) {
  const hostname = new URL(url).hostname;
  const previous = hostLastRequest.get(hostname) || 0;
  const remaining = HOST_GAP_MS - (Date.now() - previous);
  if (remaining > 0) await wait(remaining);
  hostLastRequest.set(hostname, Date.now());
}

async function createReview(sql, source, type, summary, previousHash = null, currentHash = null) {
  await sql`
    INSERT INTO review_items (listing_id, source_id, type, summary, previous_hash, current_hash)
    VALUES (${source.listing_id}, ${source.id}, ${type}, ${summary}, ${previousHash}, ${currentHash})
    ON CONFLICT (source_id, type, status) DO UPDATE SET
      summary = EXCLUDED.summary,
      previous_hash = COALESCE(review_items.previous_hash, EXCLUDED.previous_hash),
      current_hash = EXCLUDED.current_hash,
      detected_at = NOW()
  `;
}

async function checkSource(sql, source) {
  await respectHostGap(source.url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const headers = {
    "User-Agent": "CCN-Monitor/2.0 (+https://ccn.cwdzone.top/about)",
    Accept: "text/html,application/xhtml+xml,application/json,text/plain;q=0.8"
  };
  if (source.etag) headers["If-None-Match"] = source.etag;
  if (source.last_modified) headers["If-Modified-Since"] = source.last_modified;

  try {
    const response = await fetch(source.url, { headers, redirect: "follow", signal: controller.signal });
    const interval = nextIntervalDays(source);
    if (response.status === 304) {
      await sql`
        UPDATE listing_sources SET last_checked_at = NOW(), last_success_at = NOW(), last_error = NULL,
          next_check_at = NOW() + (${interval} * INTERVAL '1 day')
        WHERE id = ${source.id}
      `;
      return "unchanged";
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const contentType = response.headers.get("content-type") || "";
    const raw = await response.text();
    const normalized = normalizeContent(raw, contentType);
    if (contentType.includes("html") && normalized.length < 180) {
      throw new Error("页面依赖 JavaScript 或正文过短，需要人工核验");
    }
    const currentHash = hashContent(normalized);
    const changed = Boolean(source.content_hash && source.content_hash !== currentHash);

    await sql`
      UPDATE listing_sources SET
        etag = ${response.headers.get("etag")}, last_modified = ${response.headers.get("last-modified")},
        content_hash = ${currentHash}, last_checked_at = NOW(), last_success_at = NOW(), last_error = NULL,
        next_check_at = NOW() + (${interval} * INTERVAL '1 day')
      WHERE id = ${source.id}
    `;
    if (changed) {
      await createReview(
        sql,
        source,
        "content_changed",
        `${source.title}页面内容发生变化，请人工核对时间、规则和认可依据后再更新公开资料。`,
        source.content_hash,
        currentHash
      );
      return "changed";
    }
    return source.content_hash ? "unchanged" : "baseline";
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "未知抓取错误";
    await sql`
      UPDATE listing_sources SET last_checked_at = NOW(), last_error = ${message},
        next_check_at = NOW() + INTERVAL '1 day'
      WHERE id = ${source.id}
    `;
    await createReview(sql, source, "check_failed", `${source.title}核验失败：${message}`);
    return "failed";
  } finally {
    clearTimeout(timeout);
  }
}

export async function runMonitor({ limit = 60 } = {}) {
  if (!databaseUrl) throw new Error("缺少 DATABASE_URL");
  const sql = postgres(databaseUrl, { max: 3, idle_timeout: 10, connect_timeout: 10 });
  try {
    const sources = await sql`
      SELECT s.*, l.kind, l.status, l.registration_end, l.event_start
      FROM listing_sources s JOIN listings l ON l.id = s.listing_id
      WHERE s.active = TRUE AND s.monitor_mode = 'http'
        AND (s.next_check_at IS NULL OR s.next_check_at <= NOW())
      ORDER BY s.next_check_at ASC NULLS FIRST, s.id ASC LIMIT ${limit}
    `;
    const results = { checked: sources.length, baseline: 0, unchanged: 0, changed: 0, failed: 0 };
    let cursor = 0;
    async function worker() {
      while (cursor < sources.length) {
        const source = sources[cursor++];
        const outcome = await checkSource(sql, source);
        results[outcome] += 1;
      }
    }
    await Promise.all(Array.from({ length: Math.min(3, sources.length) }, () => worker()));
    console.log(JSON.stringify({ at: new Date().toISOString(), ...results }));
    return results;
  } finally {
    await sql.end();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runMonitor().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
