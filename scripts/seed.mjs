import { readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("缺少 DATABASE_URL");

const items = JSON.parse(
  await readFile(path.join(process.cwd(), "data", "seed-listings.json"), "utf8")
);
const sql = postgres(databaseUrl, { max: 1 });

try {
  for (const item of items) {
    await sql`
      INSERT INTO listings (
        kind, slug, title, short_title, summary, organizer, official_url, source_url,
        audience, categories, level, format, region, registration_start, registration_end,
        event_start, event_end, schedule_note, recognition, recommendation, fee, team_size,
        status, featured, published, verified_at
      ) VALUES (
        ${item.kind}, ${item.slug}, ${item.title}, ${item.short_title ?? null}, ${item.summary},
        ${item.organizer}, ${item.official_url}, ${item.source_url},
        ARRAY(SELECT jsonb_array_elements_text(${sql.json(item.audience)})),
        ARRAY(SELECT jsonb_array_elements_text(${sql.json(item.categories)})),
        ${item.level}, ${item.format},
        ${item.region}, ${item.registration_start ?? null}, ${item.registration_end ?? null},
        ${item.event_start ?? null}, ${item.event_end ?? null}, ${item.schedule_note},
        ${item.recognition}, ${item.recommendation}, ${item.fee ?? null}, ${item.team_size ?? null},
        ${item.status}, ${item.featured}, ${item.published}, ${item.verified_at ?? null}
      )
      ON CONFLICT (slug) DO NOTHING
    `;
  }
  console.log(`种子数据检查完成：${items.length} 条`);
} finally {
  await sql.end();
}
