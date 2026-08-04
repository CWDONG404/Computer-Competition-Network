import type { Metadata } from "next";

export const metadata: Metadata = { title: "收录标准" };

export default function AboutPage() {
  return (
    <article className="shell">
      <header className="page-head">
        <div><p className="eyebrow">Editorial policy</p><h1>收录标准</h1></div>
        <p>我们不追求把所有活动堆进同一张表，而是优先保留来源可靠、规则清楚、确实值得投入时间的项目。</p>
      </header>
      <div className="detail-body">
        <aside><p className="eyebrow">How it works</p><h2>四条底线</h2></aside>
        <div className="detail-prose">
          <section><h3>一手来源</h3><p>每个公开条目必须提供主办方、认证方或赛事平台的官方入口；媒体转载只能作为线索，不能作为唯一依据。</p></section>
          <section><h3>明确适用人群</h3><p>区分大学生、职业院校、在职和社会人士，避免把资格受限的项目推荐给不符合条件的人。</p></section>
          <section><h3>时间诚实</h3><p>有可靠公告才填写确切日期。无法确认时标记“待官方公告”，不会根据往年时间推算成本期事实。</p></section>
          <section><h3>推荐有理由</h3><p>说明它锻炼什么能力、适合什么基础，而不是只使用“高含金量”之类缺少依据的标签。</p></section>
          <div className="notice">本站不是主办方或认证机构。报名资格、费用、证书有效期和考试政策均应在付费前通过官网再次确认。</div>
        </div>
      </div>
    </article>
  );
}
