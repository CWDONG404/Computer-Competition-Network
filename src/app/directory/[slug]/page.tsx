import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getListingBySlug } from "@/lib/db";
import { formatDate, kindLabels, statusLabels, statusTone } from "@/types/listing";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getListingBySlug(slug);
  if (!item) return { title: "条目不存在" };
  return { title: item.title, description: item.summary };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getListingBySlug(slug);
  if (!item) notFound();

  return (
    <article className="shell">
      <header className="detail-head">
        <div>
          <div className="card-meta" style={{ justifyContent: "flex-start", gap: "var(--space-lg)" }}>
            <span className="card-kind">{kindLabels[item.kind]}</span>
            <span className="status" data-tone={statusTone[item.status]}>{statusLabels[item.status]}</span>
          </div>
          <h1>{item.title}</h1>
          <p className="lede">{item.summary}</p>
          <div className="detail-actions">
            <a className="button button--accent" href={item.official_url} target="_blank" rel="noreferrer">前往官方网站 ↗</a>
            <Link className="button" href={`/directory?kind=${item.kind}`}>返回{kindLabels[item.kind]}目录</Link>
          </div>
        </div>
        <dl className="detail-facts">
          <div className="fact-row"><dt>主办/认证方</dt><dd>{item.organizer}</dd></div>
          <div className="fact-row"><dt>适合人群</dt><dd>{item.audience.join("、")}</dd></div>
          <div className="fact-row"><dt>地区</dt><dd>{item.region}</dd></div>
          <div className="fact-row"><dt>形式</dt><dd>{item.format}</dd></div>
          <div className="fact-row"><dt>报名截止</dt><dd>{formatDate(item.registration_end)}</dd></div>
          <div className="fact-row"><dt>活动开始</dt><dd>{formatDate(item.event_start)}</dd></div>
          {item.fee && <div className="fact-row"><dt>费用</dt><dd>{item.fee}</dd></div>}
          {item.team_size && <div className="fact-row"><dt>团队要求</dt><dd>{item.team_size}</dd></div>}
        </dl>
      </header>

      <div className="detail-body">
        <aside>
          <p className="eyebrow">Schedule & evidence</p>
          <h2>时间与来源</h2>
        </aside>
        <div className="detail-prose">
          <section><h3>当前时间说明</h3><p>{item.schedule_note}</p></section>
          <section><h3>认可与特点</h3><p>{item.recognition}</p></section>
          <section><h3>为什么值得关注</h3><p>{item.recommendation}</p></section>
          <section><h3>能力方向</h3><div className="card-tags">{item.categories.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></section>
          <div className="source-note">
            <strong>核验提示</strong>
            <p>本站最后标注核验日期：{formatDate(item.verified_at)}。规则、费用和日期可能变化，请以主办方最新公告为准。</p>
            <a className="rail-link" href={item.source_url} target="_blank" rel="noreferrer">查看本条来源 ↗</a>
          </div>
        </div>
      </div>
    </article>
  );
}
