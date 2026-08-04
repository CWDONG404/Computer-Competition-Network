import Link from "next/link";
import type { Metadata } from "next";
import { ListingCard } from "@/components/ListingCard";
import { findListings, getTaxonomy } from "@/lib/db";
import { kindLabels, statusLabels, type ListingKind, type ListingStatus } from "@/types/listing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "完整目录", description: "按类型、人群、方向和状态筛选比赛与证书。" };

type SearchParams = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function DirectoryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const q = one(params.q) || "";
  const kindValue = one(params.kind);
  const statusValue = one(params.status);
  const audience = one(params.audience) || "";
  const category = one(params.category) || "";
  const page = Number(one(params.page) || "1");
  const kind = kindValue === "competition" || kindValue === "certification" ? kindValue as ListingKind : undefined;
  const statuses: ListingStatus[] = ["open", "upcoming", "year_round", "awaiting", "closed"];
  const status = statuses.includes(statusValue as ListingStatus) ? statusValue as ListingStatus : undefined;
  const [{ items, total, pageSize }, taxonomy] = await Promise.all([
    findListings({ q, kind, status, audience, category, page }),
    getTaxonomy()
  ]);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const buildPageHref = (target: number) => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (kind) next.set("kind", kind);
    if (status) next.set("status", status);
    if (audience) next.set("audience", audience);
    if (category) next.set("category", category);
    next.set("page", String(target));
    return `/directory?${next.toString()}`;
  };

  return (
    <div className="shell">
      <header className="page-head">
        <div><p className="eyebrow">The full index</p><h1>完整目录</h1></div>
        <p>搜索名称、简称、主办方或简介；再按适用人群、方向与当前状态缩小范围。</p>
      </header>

      <form className="filter-form" action="/directory" method="get">
        <div className="field"><label htmlFor="q">关键词</label><input className="input" id="q" name="q" defaultValue={q} placeholder="例如：算法、云计算、ICPC" /></div>
        <div className="field"><label htmlFor="kind">类型</label><select className="select" id="kind" name="kind" defaultValue={kind || ""}><option value="">全部</option>{Object.entries(kindLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>
        <div className="field"><label htmlFor="status">状态</label><select className="select" id="status" name="status" defaultValue={status || ""}><option value="">全部</option>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>
        <div className="field"><label htmlFor="audience">适用人群</label><select className="select" id="audience" name="audience" defaultValue={audience}><option value="">全部</option>{taxonomy.audiences.map((value) => <option value={value} key={value}>{value}</option>)}</select></div>
        <div className="field"><label htmlFor="category">方向</label><select className="select" id="category" name="category" defaultValue={category}><option value="">全部</option>{taxonomy.categories.map((value) => <option value={value} key={value}>{value}</option>)}</select></div>
        <button className="button button--accent" type="submit">筛选</button>
      </form>

      <div className="filter-result"><span>找到 {total} 条资料</span><span>第 {Math.min(page, pages)} / {pages} 页</span></div>
      <div className="listing-grid">
        {items.length ? items.map((item) => <ListingCard item={item} key={item.id} />) : <div className="empty-state">没有匹配条目。尝试减少筛选条件，或在后台补充这一方向。</div>}
      </div>
      {pages > 1 && (
        <nav className="pagination" aria-label="分页">
          {page > 1 && <Link className="button" href={buildPageHref(page - 1)}>上一页</Link>}
          {page < pages && <Link className="button" href={buildPageHref(page + 1)}>下一页</Link>}
        </nav>
      )}
    </div>
  );
}
