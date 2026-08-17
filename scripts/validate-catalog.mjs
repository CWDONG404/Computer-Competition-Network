import { catalog, catalogCounts, evidenceLabels } from "../data/catalog-v2.mjs";

const errors = [];
const expected = { competition: 70, certification: 50, platform: 3 };
const slugs = new Set();
const dateFields = [
  "registration_start",
  "registration_end",
  "event_start",
  "event_end",
  "verified_at",
  "next_review_at",
];

for (const [kind, count] of Object.entries(expected)) {
  if (catalogCounts[kind] !== count) errors.push(`${kind} 应为 ${count} 条，实际 ${catalogCounts[kind]} 条`);
}

for (const item of catalog) {
  if (slugs.has(item.slug)) errors.push(`Slug 重复：${item.slug}`);
  slugs.add(item.slug);
  if (!/^https?:\/\//.test(item.official_url)) errors.push(`官网格式错误：${item.slug}`);
  if (!item.verified_at) errors.push(`缺少核验日期：${item.slug}`);
  if (!item.audience?.length) errors.push(`缺少适用人群：${item.slug}`);
  if (!item.categories?.length) errors.push(`缺少方向：${item.slug}`);
  if (!item.evidence?.length) errors.push(`缺少证据：${item.slug}`);
  for (const field of dateFields) {
    const value = item[field];
    if (value != null && (typeof value !== "string" || Number.isNaN(Date.parse(value)))) {
      errors.push(`日期格式错误 ${field}=${String(value)}：${item.slug}`);
    }
  }
  for (const [startField, endField] of [
    ["registration_start", "registration_end"],
    ["event_start", "event_end"],
  ]) {
    const start = item[startField];
    const end = item[endField];
    if (start && end && Date.parse(start) > Date.parse(end)) {
      errors.push(`日期顺序错误 ${startField} > ${endField}：${item.slug}`);
    }
  }
  if ("recommendation_score" in item || "recommendation_level" in item || "competition_type" in item) {
    errors.push(`旧目录内容不得伪造 Phase 2 评分或类型字段：${item.slug}`);
  }
  for (const code of item.evidence ?? []) {
    if (!evidenceLabels[code]) errors.push(`未知证据标签 ${code}：${item.slug}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`目录验收通过：70 场比赛 + 50 项证书 + 3 个平台，${slugs.size} 个唯一 Slug。`);
