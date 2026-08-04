import type { Metadata } from "next";
import { evidenceLabels } from "@/types/listing";

export const metadata: Metadata = { title: "收录与核验方法" };

const evidenceNotes = {
  government: "官方页面可确认政府部门主办、承办或指导。",
  cahe_catalog: "可在中国高等教育学会竞赛目录或对应官方通知中查到。",
  international_org: "由国际专业学会、基金会或公开治理组织提供。",
  national_qualification: "属于国家职业资格、专业技术资格或官方考试安排。",
  official_vendor: "由对应产品或云平台厂商直接运营的认证。",
  hands_on_exam: "考核包含实验环境、现场操作或可验证的实践任务。",
  experience_required: "官方报考政策明确要求或建议工作经验。",
  public_output: "会产出公开排行、获奖名单、代码、论文或作品。",
  renewal_required: "证书存在有效期、继续教育或续证规则。"
} as const;

export default function AboutPage() {
  return (
    <article className="shell">
      <header className="page-head">
        <div><p className="eyebrow">方法与边界</p><h1>收录与核验方法</h1></div>
        <p>本站做信息索引，不做主观含金量打分。每个标签都必须能落到一手来源。</p>
      </header>
      <div className="policy-layout">
        <nav className="policy-nav" aria-label="本页目录">
          <a href="#scope">收录范围</a><a href="#evidence">证据标签</a><a href="#verification">核验频率</a><a href="#changes">变化处理</a><a href="#sources">来源原则</a><a href="#disclaimer">免责声明</a>
        </nav>
        <div className="policy-content">
          <section id="scope">
            <p className="eyebrow">范围定义</p><h2>收录范围</h2>
            <p>核心目录固定为 70 场具体比赛和 50 项具体证书。比赛按算法、AI/数据、安全、软件工程、创新创业、云网络与系统方向分配；证书按国内资格、安全、云平台、网络、Linux/云原生与数据软件方向分配。</p>
            <p>Kaggle、天池、Devpost 等持续发布机会的平台单列为 platform 类型，不冒充具体比赛，也不计入 120 条验收数量。</p>
          </section>
          <section id="evidence">
            <p className="eyebrow">事实标签</p><h2>证据标签</h2>
            <p>标签只说明可查事实，不代表录取、获奖、就业或薪酬承诺。</p>
            <dl className="evidence-key">{Object.entries(evidenceLabels).map(([code, label]) => <div key={code}><dt>{label}</dt><dd>{evidenceNotes[code as keyof typeof evidenceNotes]}</dd></div>)}</dl>
          </section>
          <section id="verification">
            <p className="eyebrow">检查周期</p><h2>核验频率</h2>
            <ul><li>90 天内开放或即将开始的比赛：每天一次。</li><li>其他比赛与持续机会平台：每周一次。</li><li>证书与续证政策：每月一次。</li></ul>
            <p>无法确认的日期一律写“待官方公告”，不会根据往年时间推算。</p>
          </section>
          <section id="changes">
            <p className="eyebrow">编辑流程</p><h2>官网变化不会自动发布</h2>
            <p>监测器只执行轻量 HTTP 条件请求、正文规范化和哈希比对。同域名请求间隔不少于 2 秒，并发最多 3。JavaScript 强依赖、验证码或禁止抓取的网站自动转为人工核验，不使用无头浏览器绕过。</p>
            <p>发现变化、抓取失败或资料过期后，只创建后台待审任务。管理员核对差异、接受或忽略，再手动编辑公开资料。</p>
          </section>
          <section id="sources">
            <p className="eyebrow">资料来源</p><h2>一手来源优先</h2>
            <p>优先使用教育部门、人社部门、中国高等教育学会、国际专业组织、赛事主办方、认证机构和厂商官方页面。媒体转载只能作为查找线索，不能作为唯一认可证据。</p>
          </section>
          <section id="disclaimer">
            <p className="eyebrow">使用边界</p><h2>免责声明</h2>
            <div className="notice">本站不是赛事主办方或认证机构。报名资格、费用、日期、考点、证书有效期和校内认定都可能调整；报名或付费前请在官网再次确认。</div>
          </section>
        </div>
      </div>
    </article>
  );
}
