import { readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("缺少 DATABASE_URL");

const sql = postgres(databaseUrl, { max: 1 });
const migration = await readFile(path.join(process.cwd(), "db", "001_init.sql"), "utf8");

try {
  await sql.unsafe(migration);
  console.log("数据库迁移完成");
} finally {
  await sql.end();
}
