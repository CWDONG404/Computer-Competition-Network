export type ListingKind = "competition" | "certification" | "platform";
export type ListingStatus = "open" | "upcoming" | "year_round" | "awaiting" | "closed";
export type CycleType = "fixed" | "annual" | "rolling" | "on_demand";
export type EvidenceCode =
  | "government"
  | "cahe_catalog"
  | "international_org"
  | "national_qualification"
  | "official_vendor"
  | "hands_on_exam"
  | "experience_required"
  | "public_output"
  | "renewal_required";
export type SourceRole = "official" | "rules" | "schedule" | "recognition" | "renewal";
export type ReviewStatus = "pending" | "accepted" | "dismissed";
export type ReviewType = "content_changed" | "check_failed" | "stale";

export interface Listing {
  id: number;
  kind: ListingKind;
  slug: string;
  title: string;
  short_title: string | null;
  summary: string;
  organizer: string;
  official_url: string;
  source_url: string;
  audience: string[];
  categories: string[];
  level: string;
  format: string;
  region: string;
  registration_start: string | null;
  registration_end: string | null;
  event_start: string | null;
  event_end: string | null;
  schedule_note: string;
  recognition: string;
  recommendation: string;
  fee: string | null;
  team_size: string | null;
  status: ListingStatus;
  cycle_type: CycleType;
  eligibility: string;
  language: string;
  validity_period: string | null;
  next_review_at: string | null;
  featured: boolean;
  published: boolean;
  verified_at: string | null;
  catalog_managed: boolean;
  catalog_version: number;
  created_at: string;
  updated_at: string;
}

export interface ListingSource {
  id: number;
  listing_id: number;
  role: SourceRole;
  title: string;
  url: string;
  monitor_mode: "http" | "manual";
  active: boolean;
  last_checked_at: string | null;
  last_success_at: string | null;
  next_check_at: string | null;
  last_error: string | null;
}

export interface ListingEvidence {
  id: number;
  listing_id: number;
  source_id: number | null;
  code: EvidenceCode;
  label: string;
  note: string;
  source_url?: string | null;
}

export interface ListingEvent {
  id: number;
  listing_id: number;
  source_id: number | null;
  cycle_label: string;
  event_type: "registration_open" | "registration_close" | "preliminary" | "final" | "exam_window" | "result";
  starts_at: string | null;
  ends_at: string | null;
  timezone: string;
  confirmed: boolean;
}

export interface ListingWithEvidence extends Listing {
  evidence: ListingEvidence[];
}

export interface ListingDetails extends ListingWithEvidence {
  sources: ListingSource[];
  events: ListingEvent[];
  related: ListingWithEvidence[];
}

export interface ReviewItem {
  id: number;
  listing_id: number | null;
  source_id: number | null;
  type: ReviewType;
  summary: string;
  previous_hash: string | null;
  current_hash: string | null;
  status: ReviewStatus;
  detected_at: string;
  reviewed_at: string | null;
  review_note: string | null;
  listing_title?: string | null;
  source_title?: string | null;
  source_url?: string | null;
}

export const kindLabels: Record<ListingKind, string> = {
  competition: "比赛",
  certification: "证书",
  platform: "机会平台"
};

export const statusLabels: Record<ListingStatus, string> = {
  open: "报名中",
  upcoming: "即将开始",
  year_round: "持续开放",
  awaiting: "待官方公告",
  closed: "本期已结束"
};

export const cycleLabels: Record<CycleType, string> = {
  fixed: "固定窗口",
  annual: "年度举办",
  rolling: "滚动开放",
  on_demand: "按需预约"
};

export const evidenceLabels: Record<EvidenceCode, string> = {
  government: "政府部门主办或指导",
  cahe_catalog: "高校竞赛目录",
  international_org: "国际专业组织",
  national_qualification: "国家职业资格",
  official_vendor: "厂商官方认证",
  hands_on_exam: "实操型考试",
  experience_required: "工作经验要求",
  public_output: "公开排行或作品",
  renewal_required: "需要续证或继续教育"
};

export const statusTone: Record<ListingStatus, string> = {
  open: "positive",
  upcoming: "accent",
  year_round: "neutral",
  awaiting: "muted",
  closed: "quiet"
};

export const trackOptions = [
  ["算法与程序设计", "算法与程序设计"],
  ["人工智能与数据", "人工智能与数据"],
  ["网络安全", "网络安全"],
  ["软件工程与开源", "软件工程与开源"],
  ["创新创业与黑客松", "创新创业与黑客松"],
  ["云计算与网络", "云计算与网络"],
  ["系统与高性能计算", "系统与高性能计算"],
  ["国内职业资格", "国内职业资格"],
  ["云平台", "云平台"],
  ["网络", "网络"],
  ["Linux与云原生", "Linux与云原生"],
  ["数据与软件工程", "数据与软件工程"]
] as const;

export const audienceOptions = [
  ["大学生", "大学生"],
  ["研究生", "研究生"],
  ["职业院校", "职业院校"],
  ["在职", "在职"],
  ["社会人士", "社会人士"]
] as const;

export const trackValueToLabel = Object.fromEntries(trackOptions) as Record<string, string>;
export const audienceValueToLabel = Object.fromEntries(audienceOptions) as Record<string, string>;

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "待公布";
  const date = typeof value === "string" ? new Date(`${value.slice(0, 10)}T00:00:00+08:00`) : value;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai"
  }).format(date);
}

export function scheduleLabel(item: Listing) {
  if (item.registration_end) return `报名截止 ${formatDate(item.registration_end)}`;
  if (item.event_start) return `活动开始 ${formatDate(item.event_start)}`;
  if (item.cycle_type === "on_demand") return "按需预约";
  if (item.cycle_type === "rolling" || item.status === "year_round") return "持续开放";
  return "时间待公布";
}

export function verificationLabel(item: Pick<Listing, "verified_at">) {
  return item.verified_at ? `核验于 ${formatDate(item.verified_at)}` : "等待首次核验";
}
