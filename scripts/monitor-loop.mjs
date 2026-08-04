import { runMonitor } from "./monitor-sources.mjs";

const LOOP_INTERVAL_MS = 6 * 60 * 60 * 1_000;

while (true) {
  try {
    await runMonitor();
  } catch (error) {
    console.error("监测轮次失败，公开数据未被修改。", error);
  }
  await new Promise((resolve) => setTimeout(resolve, LOOP_INTERVAL_MS));
}
