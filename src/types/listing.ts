export type ListingKind = "competition" | "certification";
export type ListingStatus = "open" | "upcoming" | "year_round" | "awaiting" | "closed";

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
  featured: boolean;
  published: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export const kindLabels: Record<ListingKind, string> = {
  competition: "比赛",
  certification: "考证"
};

export const statusLabels: Record<ListingStatus, string> = {
  open: "报名中",
  upcoming: "即将开始",
  year_round: "全年可参与",
  awaiting: "待官方公告",
  closed: "本期已结束"
};

export const statusTone: Record<ListingStatus, string> = {
  open: "positive",
  upcoming: "accent",
  year_round: "neutral",
  awaiting: "muted",
  closed: "quiet"
};

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
  return item.status === "year_round" ? "全年滚动" : "时间待公布";
}
