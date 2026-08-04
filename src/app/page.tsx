import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { getHomeData } from "@/lib/db";
import { trackOptions } from "@/types/listing";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { deadlines, rolling, latest, counts, tracks } = await getHomeData();
  const competitionCount = counts.find((item) => item.kind === "competition")?.count ?? 0;
  const certificationCount = counts.find((item) => item.kind === "certification")?.count ?? 0;
  const trackCounts = new Map(tracks.map((item) => [item.track, item.count]));
  const today = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Shanghai" }).format(new Date());

  return (
    <>
      <section className="shell intelligence-hero">
        <div className="hero-grid">
          <div>
            <p className="eyebrow">数据快照 · {today}</p>
            <h1>技术赛事情报台</h1>
            <p>先核对资格、时间与可查证据，再决定把精力投向哪里。</p>
          </div>
          <div className="hero-stats" aria-label="核心目录统计">
            <Link className="hero-stat" href="/directory?kind=competition"><strong>{competitionCount}</strong><span>场具体比赛</span></Link>
            <Link className="hero-stat" href="/directory?kind=certification"><strong>{certificationCount}</strong><span>项具体证书</span></Link>
          </div>
        </div>
        <form className="hero-search" action="/directory" method="get">
          <label className="sr-only" htmlFor="home-search">搜索比赛、证书或主办方</label>
          <input className="input" id="home-search" name="q" placeholder="搜索比赛、证书、主办方或技术方向" />
          <button className="button button--primary" type="submit">搜索 120 条严选资料</button>
        </form>
      </section>

      <section className="shell dashboard-grid" aria-label="当前机会">
        <div className="panel">
          <div className="panel-head"><h2>临近截止与即将开始</h2><Link href="/calendar">打开时间视图 →</Link></div>
          {deadlines.length ? deadlines.map((item) => <ListingCard item={item} key={item.id} />) : <div className="empty-state">当前没有已确认的临近截止日期；未确认日期不会按往年推算。</div>}
        </div>
        <div className="identity-stack">
          <Link className="identity-link" href="/directory?audience=大学生">
            <div><p className="eyebrow">在校准备</p><h2>大学生入口</h2><p>学科竞赛、程序设计、创新项目与可在校准备的认证。</p></div><span>→</span>
          </Link>
          <Link className="identity-link" href="/directory?audience=在职">
            <div><p className="eyebrow">职业进阶</p><h2>在职入口</h2><p>职业资格、厂商认证、实操考试与持续教育要求。</p></div><span>→</span>
          </Link>
          <div className="side-note">日期无法确认时统一显示“待官方公告”。平台聚合页不计入 120 条核心项目。</div>
        </div>
      </section>

      <section className="shell section-block">
        <div className="section-head">
          <div><p className="eyebrow">全年机会</p><h2>持续开放</h2></div>
          <Link className="text-link" href="/directory?status=year_round">查看全部持续项目 →</Link>
        </div>
        <div className="panel">{rolling.map((item) => <ListingCard item={item} key={item.id} />)}</div>
      </section>

      <section className="shell section-block">
        <div className="section-head">
          <div><p className="eyebrow">技术方向</p><h2>按方向进入</h2></div>
          <p>12 个主方向；证据标签只陈述可核验事实，不做主观含金量打分。</p>
        </div>
        <div className="track-index">
          {trackOptions.map(([value, label]) => (
            <Link className="track-link" href={`/directory?track=${encodeURIComponent(value)}`} key={value}>
              <span>{label}</span><span>{trackCounts.get(value) ?? 0} 条 →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="shell section-block">
        <div className="section-head">
          <div><p className="eyebrow">核验记录</p><h2>最近核验</h2></div>
          <Link className="text-link" href="/directory?sort=recently_verified">按核验日期排序 →</Link>
        </div>
        <div className="panel">{latest.slice(0, 6).map((item) => <ListingCard item={item} key={item.id} />)}</div>
      </section>
    </>
  );
}
