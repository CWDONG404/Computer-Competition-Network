import { catalog } from "../data/catalog-v2.mjs";

const urls = [...new Set(catalog.flatMap((item) => [item.official_url, item.source_url]))];
const results = [];
let cursor = 0;

async function check(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    let response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "CCN-Source-Audit/2.0 (+https://ccn.cwdzone.top/about)" }
    });
    if (response.status === 404 || response.status === 405) {
      response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent": "CCN-Source-Audit/2.0 (+https://ccn.cwdzone.top/about)",
          Range: "bytes=0-2047"
        }
      });
      await response.body?.cancel();
    }
    return { url, status: response.status, result: response.status === 404 || response.status === 410 ? "missing" : "reachable" };
  } catch (error) {
    return { url, status: null, result: "manual", error: error instanceof Error ? error.message : "unknown" };
  } finally {
    clearTimeout(timeout);
  }
}

async function worker() {
  while (cursor < urls.length) results.push(await check(urls[cursor++]));
}

await Promise.all(Array.from({ length: 3 }, () => worker()));
const summary = {
  checked: results.length,
  reachable: results.filter((item) => item.result === "reachable").length,
  missing: results.filter((item) => item.result === "missing").length,
  manual: results.filter((item) => item.result === "manual").length
};
console.log(JSON.stringify(summary));
for (const item of results.filter((result) => result.result !== "reachable")) console.log(JSON.stringify(item));
if (summary.missing > 0) process.exitCode = 1;
