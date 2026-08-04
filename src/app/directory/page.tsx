import Link from "next/link";
import type { Metadata } from "next";
import { ListingCard } from "@/components/ListingCard";
import { findListings, getTaxonomy, type ListingSort } from "@/lib/db";
import {
  audienceOptions,
  evidenceLabels,
  kindLabels,
  statusLabels,
  trackOptions,
  type EvidenceCode,
  type ListingKind,
  type ListingStatus
} from "@/types/listing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "完整目录", description: "按类型、人群、方向、证据和状态筛选 120 条比赛与证书。" };

type SearchParams = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
const kinds: ListingKind[] = ["competition", "certification", "platform"];
const statuses: ListingStatus[] = ["open", "upcoming", "year_round", "awaiting", "closed"];
const sorts: ListingSort[] = ["deadline", "recently_verified", "recognition"];
const evidenceCodes = Object.keys(evidenceLabels) as EvidenceCode[];

function FilterFields({ values, taxonomy, idPrefix }: {
  values: { q: string; kind?: ListingKind; status?: ListingStatus; audience: string; track: string; recognition: string; sort: ListingSort };
  taxonomy: Awaited<ReturnType<typeof getTaxonomy>>;
  idPrefix: string;
}) {
  return (
    <>
      <div className="field"><label htmlFor={`${idPrefix}-q`}>关键词</label><input className="input" id={`${idPrefix}-q`} name="q" defaultValue={values.q} placeholder="名称、简称、主办方" /></div>
      <div className="field"><label htmlFor={`${idPrefix}-kind`}>类型</label><select className="select" id={`${idPrefix}-kind`} name="kind" defaultValue={values.kind || ""}><option value="">比赛与证书</option>{kinds.map((value) => <option value={value} key={value}>{kindLabels[value]}</option>)}</select></div>
      <div className="field"><label htmlFor={`${idPrefix}-audience`}>适用人群</label><select className="select" id={`${idPrefix}-audience`} name="audience" defaultValue={values.audience}><option value="">全部人群</option>{audienceOptions.filter(([value]) => taxonomy.audiences.includes(value)).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>
      <div className="field"><label htmlFor={`${idPrefix}-track`}>技术方向</label><select className="select" id={`${idPrefix}-track`} name="track" defaultValue={values.track}><option value="">全部方向</option>{trackOptions.filter(([value]) => taxonomy.tracks.includes(value)).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>
      <div className="field"><label htmlFor={`${idPrefix}-recognition`}>认可证据</label><select className="select" id={`${idPrefix}-recognition`} name="recognition" defaultValue={values.recognition}><option value="">全部证据</option>{evidenceCodes.map((value) => <option value={value} key={value}>{evidenceLabels[value]}</option>)}</select></div>
      <div className="field"><label htmlFor={`${idPrefix}-status`}>时间状态</label><select className="select" id={`${idPrefix}-status`} name="status" defaultValue={values.status || ""}><option value="">全部状态</option>{statuses.map((value) => <option value={value} key={value}>{statusLabels[value]}</option>)}</select></div>
      <div className="field"><label htmlFor={`${idPrefix}-sort`}>排序</label><select className="select" id={`${idPrefix}-sort`} name="sort" defaultValue={values.sort}><option value="deadline">截止日期</option><option value="recently_verified">最近核验</option><option value="recognition">证据数量</option></select></div>
      <div className="filter-actions"><button className="button button--primary" type="submit">应用筛选</button><Link className="button" href="/directory">清除条件</Link></div>
    </>
  );
}

export default async function DirectoryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const q = one(params.q) || "";
  const kindValue = one(params.kind);
  const statusValue = one(params.status);
  const audience = one(params.audience) || "";
  const track = one(params.track) || one(params.category) || "";
  const recognitionValue = one(params.recognition) || "";
  const sortValue = one(params.sort) || "deadline";
  const page = Math.max(1, Number(one(params.page) || "1") || 1);
  const kind = kinds.includes(kindValue as ListingKind) ? kindValue as ListingKind : undefined;
  const status = statuses.includes(statusValue as ListingStatus) ? statusValue as ListingStatus : undefined;
  const recognition = evidenceCodes.includes(recognitionValue as EvidenceCode) ? recognitionValue : "";
  const sort = sorts.includes(sortValue as ListingSort) ? sortValue as ListingSort : "deadline";
  const values = { q, kind, status, audience, track, recognition, sort };
  const [{ items, total, pageSize }, taxonomy] = await Promise.all([
    findListings({ q, kind, status, audience, track, recognition, sort, page }),
    getTaxonomy()
  ]);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const active = [q, kind ? kindLabels[kind] : "", audience, track, recognition ? evidenceLabels[recognition as EvidenceCode] : "", status ? statusLabels[status] : ""].filter(Boolean);
  const buildPageHref = (target: number) => {
    const next = new URLSearchParams();
    for (const key of ["q", "kind", "audience", "track", "recognition", "status", "sort"] as const) {
      const value = values[key];
      if (value) next.set(key, String(value));
    }
    next.set("page", String(target));
    return `/directory?${next.toString()}`;
  };

  return (
    <div className="shell">
      <header className="page-head">
        <div><p className="eyebrow">核心目录</p><h1>比赛与证书目录</h1></div>
        <p>核心目录固定为 70 场具体比赛与 50 项具体证书；平台型机会单列，不混入数量。</p>
      </header>
      <div className="catalogue-layout">
        <aside className="filter-sidebar" aria-label="目录筛选">
          <div className="filter-sidebar__head"><strong>筛选条件</strong><span className="mono muted">{total}</span></div>
          <form className="filter-form" action="/directory" method="get"><FilterFields values={values} taxonomy={taxonomy} idPrefix="desktop" /></form>
        </aside>
        <div className="catalogue-main">
          <details className="mobile-filter">
            <summary>筛选与排序 <span>{active.length ? `${active.length} 项已选` : ""}</span></summary>
            <form className="filter-form" action="/directory" method="get"><FilterFields values={values} taxonomy={taxonomy} idPrefix="mobile" /></form>
          </details>
          <div className="catalogue-toolbar"><span>找到 <strong>{total}</strong> 条资料</span><span>第 {Math.min(page, pages)} / {pages} 页</span></div>
          {active.length > 0 && <div className="active-filters" aria-label="已选条件">{active.map((label, index) => <span className="active-filter" key={`${label}-${index}`}>{label}</span>)}</div>}
          <div className="catalogue-list">
            {items.length ? items.map((item) => <ListingCard item={item} key={item.id} />) : <div className="empty-state">没有匹配条目。减少一个筛选条件后再试。</div>}
          </div>
          {pages > 1 && <nav className="pagination" aria-label="分页">{page > 1 && <Link className="button" href={buildPageHref(page - 1)}>上一页</Link>}{page < pages && <Link className="button button--primary" href={buildPageHref(page + 1)}>下一页</Link>}</nav>}
        </div>
      </div>
    </div>
  );
}
