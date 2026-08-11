import { readFile } from "node:fs/promises";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("缺少 DATABASE_URL");
const sql = postgres(databaseUrl, { max: 1 });

const snapshot = async () => (await sql`
  SELECT
    (SELECT COUNT(*)::int FROM listings) AS listings,
    (SELECT COUNT(*)::int FROM listing_sources) AS sources,
    (SELECT COUNT(*)::int FROM listing_events) AS events,
    (SELECT COUNT(*)::int FROM listing_evidence) AS evidence,
    (SELECT COUNT(*)::int FROM review_items) AS reviews,
    (SELECT COUNT(DISTINCT slug)::int FROM listings) AS slugs
`)[0];

try {
  const before = await snapshot();
  const migration = await readFile(new URL("../db/003_ccn_career_radar.sql", import.meta.url), "utf8");
  await sql.unsafe(migration);
  const after = await snapshot();
  for (const key of ["listings", "sources", "events", "evidence", "reviews", "slugs"]) {
    if (after[key] < before[key]) throw new Error(`迁移导致 ${key} 数量减少：${before[key]} → ${after[key]}`);
  }
  console.log("迁移保全验收通过：003 可重复执行，Listing、Slug、来源、事件、证据和待审任务均未减少。 ");
} finally {
  await sql.end();
}
