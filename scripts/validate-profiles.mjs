import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("缺少 DATABASE_URL");
const sql = postgres(databaseUrl, { max: 1 });

try {
  const [counts] = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM competition_profiles cp JOIN listings l ON l.id=cp.listing_id WHERE l.kind='competition' AND l.catalog_managed=TRUE) AS competitions,
      (SELECT COUNT(*)::int FROM certification_profiles cp JOIN listings l ON l.id=cp.listing_id WHERE l.kind='certification' AND l.catalog_managed=TRUE) AS certifications,
      (SELECT COUNT(*)::int FROM platform_profiles pp JOIN listings l ON l.id=pp.listing_id WHERE l.kind='platform' AND l.catalog_managed=TRUE) AS platforms
  `;
  if (counts.competitions !== 70 || counts.certifications !== 50 || counts.platforms !== 3) {
    throw new Error(`Profile 数量错误：${JSON.stringify(counts)}`);
  }

  const wrongKind = await sql`
    SELECT l.slug FROM listings l
    WHERE (l.kind <> 'competition' AND EXISTS (SELECT 1 FROM competition_profiles p WHERE p.listing_id=l.id))
       OR (l.kind <> 'certification' AND EXISTS (SELECT 1 FROM certification_profiles p WHERE p.listing_id=l.id))
       OR (l.kind <> 'platform' AND EXISTS (SELECT 1 FROM platform_profiles p WHERE p.listing_id=l.id))
  `;
  if (wrongKind.length) throw new Error(`存在类型与 Profile 不匹配的条目：${wrongKind.map((row) => row.slug).join(", ")}`);

  const invalidScoreState = await sql`
    SELECT listing_id FROM competition_profiles
    WHERE (score_status='unrated' AND (recommendation_score IS NOT NULL OR recommendation_level IS NOT NULL))
       OR (score_status='published' AND (score_version IS NULL OR recommendation_score IS NULL OR recommendation_level IS NULL OR scored_at IS NULL))
    UNION ALL
    SELECT listing_id FROM certification_profiles
    WHERE (score_status='unrated' AND (recommendation_score IS NOT NULL OR recommendation_level IS NOT NULL))
       OR (score_status='published' AND (score_version IS NULL OR recommendation_score IS NULL OR recommendation_level IS NULL OR scored_at IS NULL))
  `;
  if (invalidScoreState.length) throw new Error("存在未评分显示 0/C，或公开评分快照不完整的 Profile");

  const catalogScored = await sql`
    SELECT l.slug FROM listings l
    LEFT JOIN competition_profiles cp ON cp.listing_id=l.id
    LEFT JOIN certification_profiles cert ON cert.listing_id=l.id
    WHERE l.catalog_managed=TRUE AND (
      (l.kind='competition' AND cp.score_status <> 'unrated')
      OR (l.kind='certification' AND cert.score_status <> 'unrated')
    )
  `;
  if (catalogScored.length) throw new Error("现有目录条目被批量主观评分，违反空值迁移原则");

  console.log("Profile 验收通过：70/50/3，一条一型；现有核心目录保持未评分。 ");
} finally {
  await sql.end();
}
