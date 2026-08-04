import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingCard } from "@/components/ListingCard";
import { getListingBySlug } from "@/lib/db";
import {
  cycleLabels,
  formatDate,
  kindLabels,
  statusLabels,
  statusTone,
  verificationLabel
} from "@/types/listing";

export const dynamic = "force-dynamic";

const eventLabels = {
  registration_open: "报名开放",
  registration_close: "报名截止",
  preliminary: "初赛或活动开始",
  final: "决赛",
  exam_window: "考试窗口",
  result: "结果公布"
} as const;

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
  const fallbackEvents = [
    item.registration_start && { label: "报名开放", date: item.registration_start },
    item.registration_end && { label: "报名截止", date: item.registration_end },
    item.event_start && { label: item.kind === "certification" ? "考试窗口" : "活动开始", date: item.event_start },
    item.event_end && { label: "活动结束", date: item.event_end }
  ].filter(Boolean) as { label: string; date: string }[];

  return (
    <article className="shell">
      <div className="detail-studio">
        <header className="detail-summary">
          <div className="chip-line" style={{ marginTop: 0 }}>
            <span className="kind-label">{kindLabels[item.kind]}</span>
            <span className="status" data-tone={statusTone[item.status]}>{statusLabels[item.status]}</span>
          </div>
          <h1>{item.title}</h1>
          <p className="lede">{item.summary}</p>
          <div className="detail-actions">
            <a className="button button--primary" href={item.official_url} target="_blank" rel="noreferrer">打开官网 ↗</a>
            <Link className="button" href={`/directory?kind=${item.kind}`}>返回{kindLabels[item.kind]}目录</Link>
          </div>
          <div className="detail-verification"><strong>{verificationLabel(item)}</strong><br />页面变化只会进入后台待审，不会自动修改此公开内容。</div>
        </header>

        <div className="detail-panels">
          <section className="detail-panel">
            <h2>先看结论</h2>
            <dl className="fact-list">
              <div className="fact-row"><dt>主办 / 认证方</dt><dd>{item.organizer}</dd></div>
              <div className="fact-row"><dt>适用人群</dt><dd>{item.audience.join("、")}</dd></div>
              <div className="fact-row"><dt>资格条件</dt><dd>{item.eligibility}</dd></div>
              <div className="fact-row"><dt>方向</dt><dd>{item.categories.join("、")}</dd></div>
              <div className="fact-row"><dt>形式 / 地区</dt><dd>{item.format} · {item.region}</dd></div>
              <div className="fact-row"><dt>语言</dt><dd>{item.language}</dd></div>
              <div className="fact-row"><dt>周期</dt><dd>{cycleLabels[item.cycle_type]}</dd></div>
              {item.fee && <div className="fact-row"><dt>费用</dt><dd>{item.fee}</dd></div>}
              {item.team_size && <div className="fact-row"><dt>团队要求</dt><dd>{item.team_size}</dd></div>}
              {item.validity_period && <div className="fact-row"><dt>有效期</dt><dd>{item.validity_period}</dd></div>}
            </dl>
          </section>

          <section className="detail-panel">
            <h2>时间轴</h2>
            {(item.events.length > 0 || fallbackEvents.length > 0) ? <ol className="timeline">
              {item.events.length > 0 ? item.events.map((event) => <li key={event.id}><time>{formatDate(event.starts_at)}</time><strong>{eventLabels[event.event_type]}</strong><span>{event.confirmed ? "官方来源已确认" : "等待人工确认"}</span></li>) : fallbackEvents.map((event) => <li key={`${event.label}-${event.date}`}><time>{formatDate(event.date)}</time><strong>{event.label}</strong><span>来自当前公开资料</span></li>)}
            </ol> : <div className="empty-state">{item.schedule_note}</div>}
          </section>

          <section className="detail-panel">
            <h2>认可证据</h2>
            <div className="evidence-list">
              {item.evidence.map((evidence) => <div className="evidence-item" key={evidence.id}><strong>{evidence.label}</strong><p>{evidence.note}</p>{evidence.source_url && <a className="text-link" href={evidence.source_url} target="_blank" rel="noreferrer">查看对应来源 ↗</a>}</div>)}
              <div className="evidence-item"><strong>编辑结论</strong><p>{item.recognition}</p></div>
              <div className="evidence-item"><strong>下一步建议</strong><p>{item.recommendation}</p></div>
            </div>
          </section>

          <section className="detail-panel">
            <h2>核验来源</h2>
            <div className="source-list">{item.sources.map((source) => <div className="source-item" key={source.id}><a className="text-link" href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a><p>{source.monitor_mode === "manual" ? "需要人工核验" : source.last_success_at ? `最近自动检查：${formatDate(source.last_success_at)}` : "等待首次条件请求"}</p></div>)}</div>
          </section>
        </div>
      </div>

      {item.related.length > 0 && <section className="section-block"><div className="section-head"><div><p className="eyebrow">同方向</p><h2>相似项目</h2></div></div><div className="related-list">{item.related.map((related) => <ListingCard item={related} key={related.id} />)}</div></section>}
    </article>
  );
}
