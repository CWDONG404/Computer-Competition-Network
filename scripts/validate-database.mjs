import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("缺少 DATABASE_URL");

const sql = postgres(databaseUrl, { max: 1 });

try {
  const [counts] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE kind='competition' AND catalog_managed=TRUE AND published=TRUE)::int AS competitions,
      COUNT(*) FILTER (WHERE kind='certification' AND catalog_managed=TRUE AND published=TRUE)::int AS certifications,
      COUNT(*) FILTER (WHERE kind='platform' AND catalog_managed=TRUE AND published=TRUE)::int AS platforms
    FROM listings
  `;

  if (counts.competitions !== 70 || counts.certifications !== 50 || counts.platforms !== 3) {
    throw new Error(`数据库目录数量不符合验收：比赛 ${counts.competitions}、证书 ${counts.certifications}、平台 ${counts.platforms}`);
  }

  const invalid = await sql`
    SELECT l.slug
    FROM listings l
    WHERE l.published=TRUE AND (
      NULLIF(BTRIM(l.official_url), '') IS NULL
      OR l.verified_at IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM listing_sources s
        WHERE s.listing_id=l.id AND s.role='official' AND s.active=TRUE
      )
      OR NOT EXISTS (SELECT 1 FROM listing_evidence e WHERE e.listing_id=l.id)
    )
    ORDER BY l.slug
  `;
  if (invalid.length > 0) {
    throw new Error(`存在缺少官网、证据或核验日期的公开条目：${invalid.map((row) => row.slug).join(", ")}`);
  }

  const duplicates = await sql`
    SELECT slug, COUNT(*)::int AS count FROM listings GROUP BY slug HAVING COUNT(*) > 1
  `;
  if (duplicates.length > 0) {
    throw new Error(`存在重复 Slug：${duplicates.map((row) => row.slug).join(", ")}`);
  }

  console.log("数据库验收通过：70 场比赛、50 项证书、3 个平台；公开条目官网、证据和核验日期完整。 ");
} finally {
  await sql.end();
}
