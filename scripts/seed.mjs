import postgres from "postgres";
import { readFileSync } from "node:fs";
import { catalog, evidenceLabels } from "../data/catalog-v2.mjs";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("缺少 DATABASE_URL");

const sql = postgres(databaseUrl, { max: 1 });
const CATALOG_VERSION = 3;
const legacyCatalog = JSON.parse(readFileSync(new URL("../data/seed-listings.json", import.meta.url), "utf8"));
const currentCatalogSlugs = new Set(catalog.map((item) => item.slug));
const retiredLegacySlugs = legacyCatalog.map((item) => item.slug).filter((slug) => !currentCatalogSlugs.has(slug));
const manualHosts = new Set([
  "tianchi.aliyun.com",
  "e.huawei.com",
  "competition.huaweicloud.com",
  "www.facebook.com",
  "www.synapse.org",
  "cy.ncss.cn",
  "www.ciscn.cn",
  "www.xctf.org.cn",
  "www.qiangwangbei.com",
  "tjjmds.ai-learning.net",
  "capturetheflag.withgoogle.com",
  "picoctf.org",
  "www.cnsofttesting.com",
  "summerofcode.withgoogle.com",
  "net.c4best.cn",
  "imaginecup.microsoft.com",
  "www.asc-events.org",
  "aws.amazon.com",
  "cloud.google.com",
  "education.oracle.com"
]);

function monitorMode(url) {
  try {
    return manualHosts.has(new URL(url).hostname) || url.includes("#/") ? "manual" : "http";
  } catch {
    return "manual";
  }
}

try {
  await sql`
    UPDATE listings SET published=FALSE
    WHERE catalog_managed=FALSE AND catalog_version=0
      AND slug IN (SELECT jsonb_array_elements_text(${sql.json(retiredLegacySlugs)}))
  `;

  for (const item of catalog) {
    const rows = await sql`
      INSERT INTO listings (
        kind, slug, title, short_title, summary, organizer, official_url, source_url,
        audience, categories, level, format, region, registration_start, registration_end,
        event_start, event_end, schedule_note, recognition, recommendation, fee, team_size,
        status, featured, published, verified_at, cycle_type, eligibility, language,
        validity_period, next_review_at, verification_status, topics, technologies,
        target_roles, special_tags, catalog_managed, catalog_version
      ) VALUES (
        ${item.kind}, ${item.slug}, ${item.title}, ${item.short_title ?? null}, ${item.summary},
        ${item.organizer}, ${item.official_url}, ${item.source_url},
        ARRAY(SELECT jsonb_array_elements_text(${sql.json(item.audience)})),
        ARRAY(SELECT jsonb_array_elements_text(${sql.json(item.categories)})),
        ${item.level}, ${item.format}, ${item.region}, ${item.registration_start ?? null},
        ${item.registration_end ?? null}, ${item.event_start ?? null}, ${item.event_end ?? null},
        ${item.schedule_note}, ${item.recognition}, ${item.recommendation}, ${item.fee ?? null},
        ${item.team_size ?? null}, ${item.status}, ${item.featured}, ${item.published},
        ${item.verified_at}, ${item.cycle_type}, ${item.eligibility}, ${item.language},
        ${item.validity_period ?? null}, ${item.next_review_at}, 'partial',
        ARRAY(SELECT jsonb_array_elements_text(${sql.json(item.categories)})),
        ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], TRUE, ${CATALOG_VERSION}
      )
      ON CONFLICT (slug) DO UPDATE SET
        kind = EXCLUDED.kind,
        title = EXCLUDED.title,
        short_title = EXCLUDED.short_title,
        summary = EXCLUDED.summary,
        organizer = EXCLUDED.organizer,
        official_url = EXCLUDED.official_url,
        source_url = EXCLUDED.source_url,
        audience = EXCLUDED.audience,
        categories = EXCLUDED.categories,
        level = EXCLUDED.level,
        format = EXCLUDED.format,
        region = EXCLUDED.region,
        registration_start = EXCLUDED.registration_start,
        registration_end = EXCLUDED.registration_end,
        event_start = EXCLUDED.event_start,
        event_end = EXCLUDED.event_end,
        schedule_note = EXCLUDED.schedule_note,
        recognition = EXCLUDED.recognition,
        recommendation = EXCLUDED.recommendation,
        fee = EXCLUDED.fee,
        team_size = EXCLUDED.team_size,
        status = EXCLUDED.status,
        featured = EXCLUDED.featured,
        published = EXCLUDED.published,
        verified_at = EXCLUDED.verified_at,
        cycle_type = EXCLUDED.cycle_type,
        eligibility = EXCLUDED.eligibility,
        language = EXCLUDED.language,
        validity_period = EXCLUDED.validity_period,
        next_review_at = EXCLUDED.next_review_at,
        verification_status = EXCLUDED.verification_status,
        topics = EXCLUDED.topics,
        technologies = EXCLUDED.technologies,
        target_roles = EXCLUDED.target_roles,
        special_tags = EXCLUDED.special_tags,
        catalog_managed = TRUE,
        catalog_version = EXCLUDED.catalog_version
      WHERE listings.catalog_managed = TRUE OR listings.catalog_version = 0
      RETURNING id, catalog_managed
    `;

    const listingRecord = rows[0] ?? (await sql`SELECT id, catalog_managed FROM listings WHERE slug = ${item.slug}`)[0];
    const listingId = listingRecord.id;
    if (!listingRecord.catalog_managed) continue;
    await sql`
      UPDATE listing_sources SET active = FALSE
      WHERE listing_id = ${listingId} AND role IN ('official', 'rules')
    `;
    const sourceRows = await sql`
      INSERT INTO listing_sources (listing_id, role, title, url, monitor_mode, next_check_at)
      VALUES (${listingId}, 'official', '官方网站', ${item.official_url}, ${monitorMode(item.official_url)}, NOW())
      ON CONFLICT (listing_id, role, url) DO UPDATE SET
        title = EXCLUDED.title,
        monitor_mode = EXCLUDED.monitor_mode,
        active = TRUE,
        next_check_at = COALESCE(listing_sources.next_check_at, NOW())
      RETURNING id
    `;
    const officialSourceId = sourceRows[0].id;

    if (item.source_url !== item.official_url) {
      await sql`
        INSERT INTO listing_sources (listing_id, role, title, url, monitor_mode, next_check_at)
        VALUES (${listingId}, 'rules', '规则或公告来源', ${item.source_url}, ${monitorMode(item.source_url)}, NOW())
        ON CONFLICT (listing_id, role, url) DO UPDATE SET
          title = EXCLUDED.title, monitor_mode = EXCLUDED.monitor_mode, active = TRUE,
          next_check_at = COALESCE(listing_sources.next_check_at, NOW())
      `;
    }

    for (const code of item.evidence) {
      await sql`
        INSERT INTO listing_evidence (listing_id, source_id, code, label, note)
        VALUES (
          ${listingId}, ${officialSourceId}, ${code}, ${evidenceLabels[code]},
          ${`依据 ${item.organizer} 的公开页面核验；具体适用范围以对应组织或机构政策为准。`}
        )
        ON CONFLICT (listing_id, code) DO UPDATE SET
          source_id = EXCLUDED.source_id,
          label = EXCLUDED.label,
          note = EXCLUDED.note
      `;
    }

    const cycleLabel = item.verified_at?.slice(0, 4) || "当前周期";
    const events = [
      item.registration_start && ["registration_open", item.registration_start, item.registration_start],
      item.registration_end && ["registration_close", item.registration_end, item.registration_end],
      item.event_start && [item.kind === "certification" ? "exam_window" : "preliminary", item.event_start, item.event_end || item.event_start]
    ].filter(Boolean);
    for (const [eventType, startsAt, endsAt] of events) {
      await sql`
        INSERT INTO listing_events (listing_id, source_id, cycle_label, event_type, starts_at, ends_at, confirmed)
        VALUES (${listingId}, ${officialSourceId}, ${cycleLabel}, ${eventType}, ${startsAt}, ${endsAt}, TRUE)
        ON CONFLICT (listing_id, cycle_label, event_type, starts_at) DO UPDATE SET
          source_id = EXCLUDED.source_id, ends_at = EXCLUDED.ends_at, confirmed = EXCLUDED.confirmed
      `;
    }

    if (item.kind === "competition") {
      await sql`
        INSERT INTO competition_profiles (listing_id, score_status)
        VALUES (${listingId}, 'unrated')
        ON CONFLICT (listing_id) DO UPDATE SET score_status='unrated', score_version=NULL,
          recommendation_score=NULL, recommendation_level=NULL, scored_at=NULL
      `;
    } else if (item.kind === "certification") {
      await sql`
        INSERT INTO certification_profiles (
          listing_id, category, exam_format, price, validity, score_status
        ) VALUES (
          ${listingId}, ${item.categories[0] ?? null}, ${item.format}, ${item.fee ?? null},
          ${item.validity_period ?? null}, 'unrated'
        )
        ON CONFLICT (listing_id) DO UPDATE SET
          category=EXCLUDED.category, exam_format=EXCLUDED.exam_format, price=EXCLUDED.price,
          validity=EXCLUDED.validity, score_status='unrated', score_version=NULL,
          recommendation_score=NULL, recommendation_level=NULL, scored_at=NULL
      `;
    } else {
      await sql`
        INSERT INTO platform_profiles (listing_id, platform_types, check_frequency)
        VALUES (
          ${listingId}, ARRAY(SELECT jsonb_array_elements_text(${sql.json(item.categories)})), 'weekly'
        )
        ON CONFLICT (listing_id) DO UPDATE SET
          platform_types=EXCLUDED.platform_types, check_frequency=EXCLUDED.check_frequency
      `;
    }
  }

  const counts = await sql`
    SELECT kind, COUNT(*)::int AS count
    FROM listings
    WHERE published = TRUE AND kind IN ('competition', 'certification', 'platform')
    GROUP BY kind ORDER BY kind
  `;
  console.log(`目录数据检查完成：${catalog.length} 条`, counts);
} finally {
  await sql.end();
}
