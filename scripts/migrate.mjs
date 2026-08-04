import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("缺少 DATABASE_URL");

const sql = postgres(databaseUrl, { max: 1 });
try {
  const directory = path.join(process.cwd(), "db");
  const files = (await readdir(directory)).filter((file) => /^\d+_.+\.sql$/.test(file)).sort();
  for (const file of files) {
    const migration = await readFile(path.join(directory, file), "utf8");
    await sql.unsafe(migration);
    console.log(`数据库迁移完成：${file}`);
  }
} finally {
  await sql.end();
}
