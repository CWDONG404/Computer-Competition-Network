import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("缺少 DATABASE_URL");

const sql = postgres(databaseUrl, { max: 1 });
const sentinel = "管理员保留内容 · 种子保护测试";
let listing;

function runSeed() {
  const result = spawnSync(process.execPath, ["scripts/seed.mjs"], {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit"
  });
  if (result.status !== 0) throw new Error("种子导入失败");
}

try {
  [listing] = await sql`SELECT id, title FROM listings WHERE catalog_managed=TRUE ORDER BY id LIMIT 1`;
  assert(listing, "缺少目录管理条目");
  await sql`UPDATE listings SET title=${sentinel}, catalog_managed=FALSE WHERE id=${listing.id}`;
  runSeed();
  const [after] = await sql`SELECT title, catalog_managed FROM listings WHERE id=${listing.id}`;
  assert.equal(after.title, sentinel, "种子导入覆盖了管理员接管的内容");
  assert.equal(after.catalog_managed, false, "种子导入重新夺回了管理员接管的内容");
  console.log("种子所有权验收通过：管理员接管的条目不会被目录更新覆盖。");
} finally {
  if (listing) {
    await sql`UPDATE listings SET catalog_managed=TRUE WHERE id=${listing.id}`;
    runSeed();
  }
  await sql.end();
}
