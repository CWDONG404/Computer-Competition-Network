import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const password = process.argv[2];

if (!password || password.length < 12) {
  console.error("用法：npm run auth:hash -- '至少12位的管理员密码'");
  process.exit(1);
}

const salt = randomBytes(16);
const derived = await scrypt(password, salt, 64);
console.log(`scrypt$${salt.toString("hex")}$${Buffer.from(derived).toString("hex")}`);
