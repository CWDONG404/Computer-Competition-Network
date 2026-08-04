import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { getHomeData } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { featured, latest, counts, categories } = await getHomeData();
  const competitionCount = counts.find((item) => item.kind === "competition")?.count ?? 0;
  const certificationCount = counts.find((item) => item.kind === "certification")?.count ?? 0;
  const total = competitionCount + certificationCount;
  const today = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Shanghai" }).format(new Date());

  return (
    <>
      <section className="shell home-intro">
        <div>
          <p className="eyebrow">Computer Competition Network</p>
          <h1>值得投入时间的比赛与证书</h1>
        </div>
        <div className="intro-note">
          <p>为大学生和在职学习者整理。每个条目都保留官网入口、适用人群、时间状态与推荐理由。</p>
          <p className="mono muted" style={{ marginTop: "var(--space-md)", fontSize: "var(--text-xs)" }}>资料日期 · {today}</p>
        </div>
      </section>

      <section className="shell count-strip" aria-label="资料统计">
        <Link className="count-cell" href="/directory"><strong>{total}</strong><span>已发布条目</span></Link>
        <Link className="count-cell" href="/directory?kind=competition"><strong>{competitionCount}</strong><span>比赛与黑客松</span></Link>
        <Link className="count-cell" href="/directory?kind=certification"><strong>{certificationCount}</strong><span>职业证书与考试</span></Link>
      </section>

      <section className="shell discovery-rail">
        <div className="rail-head">
          <div><p className="eyebrow">Editor’s selection</p><h2>优先关注</h2></div>
          <Link className="rail-link" href="/directory">查看完整目录 →</Link>
        </div>
        <div className="listing-grid">
          {featured.map((item, index) => <ListingCard item={item} key={item.id} wide={index === 0} />)}
        </div>
      </section>

      <section className="shell discovery-rail rule-top">
        <div className="rail-head">
          <div><p className="eyebrow">Browse by field</p><h2>按方向浏览</h2></div>
          <p className="muted">从技能方向进入，比从奖项名称进入更快。</p>
        </div>
        <div className="category-index">
          {categories.map((item) => (
            <Link className="category-link" href={`/directory?category=${encodeURIComponent(item.category)}`} key={item.category}>
              <span>{item.category}</span><span>{item.count} 条资料 →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="shell discovery-rail rule-top">
        <div className="rail-head">
          <div><p className="eyebrow">Recently updated</p><h2>最近更新</h2></div>
          <Link className="rail-link" href="/directory?status=year_round">查看全年项目 →</Link>
        </div>
        <div className="listing-grid">
          {latest.slice(0, 6).map((item) => <ListingCard item={item} key={item.id} />)}
        </div>
      </section>
    </>
  );
}
