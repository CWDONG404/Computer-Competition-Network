import postgres from "postgres";
import { catalog } from "../data/catalog-v2.mjs";

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
      OR l.verification_status NOT IN ('verified', 'partial')
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

  const legacyPublished = await sql`
    SELECT slug FROM listings
    WHERE published=TRUE AND catalog_managed=FALSE AND catalog_version=0
    ORDER BY slug
  `;
  if (legacyPublished.length > 0) {
    throw new Error(`仍有旧版种子条目公开：${legacyPublished.map((row) => row.slug).join(", ")}`);
  }

  const duplicates = await sql`
    SELECT slug, COUNT(*)::int AS count FROM listings GROUP BY slug HAVING COUNT(*) > 1
  `;
  if (duplicates.length > 0) {
    throw new Error(`存在重复 Slug：${duplicates.map((row) => row.slug).join(", ")}`);
  }

  const catalogRows = await sql`
    SELECT slug FROM listings WHERE catalog_managed=TRUE AND published=TRUE ORDER BY slug
  `;
  const expectedSlugs = catalog.map((item) => item.slug).sort();
  const actualSlugs = catalogRows.map((row) => row.slug);
  if (actualSlugs.length !== expectedSlugs.length || actualSlugs.some((slug, index) => slug !== expectedSlugs[index])) {
    throw new Error("数据库中的目录 Slug 与 catalog-v2.mjs 不完全一致");
  }

  const [profileCounts] = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM competition_profiles cp JOIN listings l ON l.id=cp.listing_id WHERE l.kind='competition' AND l.catalog_managed=TRUE) AS competitions,
      (SELECT COUNT(*)::int FROM certification_profiles cp JOIN listings l ON l.id=cp.listing_id WHERE l.kind='certification' AND l.catalog_managed=TRUE) AS certifications,
      (SELECT COUNT(*)::int FROM platform_profiles pp JOIN listings l ON l.id=pp.listing_id WHERE l.kind='platform' AND l.catalog_managed=TRUE) AS platforms
  `;
  if (profileCounts.competitions !== 70 || profileCounts.certifications !== 50 || profileCounts.platforms !== 3) {
    throw new Error(`Profile 数量不符合验收：${JSON.stringify(profileCounts)}`);
  }

  console.log("数据库验收通过：70 场比赛、50 项证书、3 个平台；公开条目的 Profile、官网、证据与核验状态完整。 ");
} finally {
  await sql.end();
}
