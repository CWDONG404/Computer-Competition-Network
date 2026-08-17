import Link from "next/link";
import type { Metadata } from "next";
import { ListingCard } from "@/components/ListingCard";
import { getCalendarData } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "赛事日历", description: "按 7 天、30 天、季度与全年查看比赛报名和开始时间。" };

const views = [
  ["7", "未来 7 天", 7],
  ["30", "未来 30 天", 30],
  ["quarter", "未来一季度", 90],
  ["year", "未来全年", 365]
] as const;

function calendarDate(value: string | Date) {
  const dateOnly = value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
  return new Date(`${dateOnly}T00:00:00+08:00`);
}

export default async function CalendarPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const raw = Array.isArray(params.view) ? params.view[0] : params.view;
  const selected = views.find(([value]) => value === raw) || views[1];
  const items = await getCalendarData();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + selected[2]);
  const dated = items.filter((item) => {
    const value = item.registration_end || item.event_start;
    if (!value) return false;
    const date = calendarDate(value);
    return date >= start && date <= end;
  });
  const rolling = items.filter((item) => item.status === "year_round" || item.cycle_type === "rolling");
  const groups = new Map<string, typeof dated>();
  for (const item of dated) {
    const value = item.registration_end || item.event_start!;
    const label = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", timeZone: "Asia/Shanghai" }).format(calendarDate(value));
    groups.set(label, [...(groups.get(label) || []), item]);
  }

  return (
    <div className="shell">
      <header className="page-head">
        <div><p className="eyebrow">时间索引</p><h1>赛事时间视图</h1></div>
        <p>只展示官网已确认日期；没有可靠公告的项目继续标记“待官方公告”，不会用往年日期填空。</p>
      </header>
      <nav className="calendar-controls" aria-label="日历范围">
        {views.map(([value, label]) => <Link href={`/calendar?view=${value}`} aria-current={selected[0] === value ? "page" : undefined} key={value}>{label}</Link>)}
      </nav>
      {groups.size === 0 && <div className="side-note">此时间范围内暂时没有已确认的截止或开始日期。你仍可查看下方持续开放项目。</div>}
      {[...groups.entries()].map(([label, entries]) => (
        <section className="calendar-group" key={label}><h2>{label}</h2><div className="calendar-list">{entries.map((item) => <ListingCard item={item} key={item.id} />)}</div></section>
      ))}
      <section className="calendar-group"><h2>持续开放</h2><div className="calendar-list">{rolling.length ? rolling.map((item) => <ListingCard item={item} key={item.id} />) : <div className="empty-state">暂无持续开放比赛。</div>}</div></section>
    </div>
  );
}
