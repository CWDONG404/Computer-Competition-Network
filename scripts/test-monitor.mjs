import assert from "node:assert/strict";
import { createServer } from "node:http";
import postgres from "postgres";
import { runMonitor } from "./monitor-sources.mjs";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("缺少 DATABASE_URL");
const sql = postgres(databaseUrl, { max: 1 });
let mode = "A";
const server = createServer((_, response) => {
  if (mode === "error") {
    response.writeHead(500, { "content-type": "text/plain" });
    response.end("failed");
    return;
  }
  response.writeHead(200, { "content-type": "text/html", etag: `\"${mode}\"` });
  response.end(`<html><body><main>${`版本 ${mode} 官方规则正文 `.repeat(30)}</main></body></html>`);
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
const testUrl = `http://127.0.0.1:${address.port}/official`;

try {
  const [source] = await sql`SELECT id, listing_id FROM listing_sources ORDER BY id LIMIT 1`;
  assert(source, "缺少可测试来源");
  await sql`UPDATE listing_sources SET active = (id = ${source.id})`;
  await sql`
    UPDATE listing_sources SET url = ${testUrl}, monitor_mode = 'http', etag = NULL, last_modified = NULL,
      content_hash = NULL, next_check_at = NOW(), last_error = NULL WHERE id = ${source.id}
  `;
  await sql`DELETE FROM review_items WHERE source_id = ${source.id}`;
  const [before] = await sql`SELECT title, summary, published, updated_at FROM listings WHERE id = ${source.listing_id}`;

  const baseline = await runMonitor({ limit: 1 });
  assert.equal(baseline.baseline, 1, "首次请求应只建立基线");

  mode = "B";
  await sql`UPDATE listing_sources SET next_check_at = NOW(), etag = NULL WHERE id = ${source.id}`;
  const changed = await runMonitor({ limit: 1 });
  assert.equal(changed.changed, 1, "正文变化应创建待审任务");

  await sql`UPDATE listing_sources SET next_check_at = NOW(), etag = NULL WHERE id = ${source.id}`;
  await runMonitor({ limit: 1 });
  const [{ count: changeCount }] = await sql`
    SELECT COUNT(*)::int AS count FROM review_items
    WHERE source_id = ${source.id} AND type = 'content_changed' AND status = 'pending'
  `;
  assert.equal(changeCount, 1, "同一变化只应保留一条待审任务");

  mode = "error";
  await sql`UPDATE listing_sources SET next_check_at = NOW(), etag = NULL WHERE id = ${source.id}`;
  const failed = await runMonitor({ limit: 1 });
  assert.equal(failed.failed, 1, "抓取失败应进入失败任务");

  const [after] = await sql`SELECT title, summary, published, updated_at FROM listings WHERE id = ${source.listing_id}`;
  assert.deepEqual(after, before, "监测不得修改公开条目");
  console.log("监测验收通过：基线、单条变化待审、失败隔离、公开数据不变。");
} finally {
  server.close();
  await sql.end();
}
