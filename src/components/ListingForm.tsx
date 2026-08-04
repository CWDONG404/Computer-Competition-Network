"use client";

import { useActionState, useState } from "react";
import { saveListingAction, type FormState } from "@/app/admin/actions";
import { evidenceLabels, type EvidenceCode, type ListingWithEvidence } from "@/types/listing";

const initialState: FormState = {};
const dateValue = (value: string | null | undefined) => value ? String(value).slice(0, 10) : "";

function ErrorText({ errors }: { errors?: string[] }) {
  return <small aria-live="polite" style={{ color: "var(--color-error)" }}>{errors?.[0] || ""}</small>;
}

export function ListingForm({ item }: { item?: ListingWithEvidence | null }) {
  const [state, action, pending] = useActionState(saveListingAction, initialState);
  const [clientError, setClientError] = useState<string | null>(null);
  return (
    <form action={action} onSubmit={(event) => {
      const values = new FormData(event.currentTarget);
      const wantsPublish = values.get("published") === "on";
      const hasVerifiedDate = Boolean(values.get("verified_at"));
      const hasEvidence = values.getAll("evidence_codes").length > 0;
      if (wantsPublish && (!hasVerifiedDate || !hasEvidence)) {
        event.preventDefault();
        setClientError("发布前必须填写核验日期，并至少选择一项可追溯的认可证据。");
        return;
      }
      setClientError(null);
    }} style={{ display: "grid", gap: "var(--space-xl)", paddingBottom: "var(--space-3xl)" }}>
      {item && <input type="hidden" name="id" value={item.id} />}
      {(clientError || state.error) && <div className="error-message" role="alert">{clientError || state.error}</div>}
      <div className="filter-form" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        <div className="field"><label htmlFor="kind">类型</label><select className="select" id="kind" name="kind" defaultValue={item?.kind || "competition"}><option value="competition">比赛</option><option value="certification">考证</option><option value="platform">机会平台</option></select></div>
        <div className="field"><label htmlFor="status">状态</label><select className="select" id="status" name="status" defaultValue={item?.status || "awaiting"}><option value="open">报名中</option><option value="upcoming">即将开始</option><option value="year_round">全年可参与</option><option value="awaiting">待官方公告</option><option value="closed">本期已结束</option></select></div>
        <div className="field"><label htmlFor="slug">Slug</label><input className="input" id="slug" name="slug" defaultValue={item?.slug || ""} placeholder="icpc-2026" required /><ErrorText errors={state.fieldErrors?.slug} /></div>
      </div>

      <section style={{ display: "grid", gap: "var(--space-lg)" }}>
        <div className="field"><label htmlFor="title">完整名称</label><input className="input" id="title" name="title" defaultValue={item?.title || ""} required /><ErrorText errors={state.fieldErrors?.title} /></div>
        <div className="field"><label htmlFor="short_title">简称</label><input className="input" id="short_title" name="short_title" defaultValue={item?.short_title || ""} /></div>
        <div className="field"><label htmlFor="summary">一句话简介</label><textarea className="textarea" id="summary" name="summary" defaultValue={item?.summary || ""} required /><ErrorText errors={state.fieldErrors?.summary} /></div>
      </section>

      <section style={{ display: "grid", gap: "var(--space-md)" }}>
        <div><p className="eyebrow">认可证据</p><p className="muted">发布条目至少选择一项；保存后会关联到官方网站来源。</p></div>
        <div className="evidence-picker">
          {(Object.entries(evidenceLabels) as [EvidenceCode, string][]).map(([code, label]) => (
            <label key={code}><input name="evidence_codes" type="checkbox" value={code} defaultChecked={item?.evidence.some((evidence) => evidence.code === code)} /><span>{label}</span></label>
          ))}
        </div>
      </section>

      <section className="filter-form" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        <div className="field"><label htmlFor="cycle_type">周期类型</label><select className="select" id="cycle_type" name="cycle_type" defaultValue={item?.cycle_type || "annual"}><option value="fixed">固定窗口</option><option value="annual">年度举办</option><option value="rolling">滚动开放</option><option value="on_demand">按需预约</option></select></div>
        <div className="field"><label htmlFor="language">语言</label><input className="input" id="language" name="language" defaultValue={item?.language || "中文或英文"} required /></div>
        <div className="field"><label htmlFor="validity_period">证书有效期</label><input className="input" id="validity_period" name="validity_period" defaultValue={item?.validity_period || ""} placeholder="不适用可留空" /></div>
        <div className="field" style={{ gridColumn: "span 2" }}><label htmlFor="eligibility">资格条件</label><textarea className="textarea" id="eligibility" name="eligibility" defaultValue={item?.eligibility || "以官方规则为准"} required /></div>
        <div className="field"><label htmlFor="next_review_at">下次复核</label><input className="input" id="next_review_at" name="next_review_at" type="date" defaultValue={dateValue(item?.next_review_at)} /></div>
      </section>

      <section className="detail-body" style={{ paddingBlock: "var(--space-xl)" }}>
        <div style={{ display: "grid", gap: "var(--space-lg)" }}>
          <div className="field"><label htmlFor="organizer">主办/认证方</label><input className="input" id="organizer" name="organizer" defaultValue={item?.organizer || ""} required /></div>
          <div className="field"><label htmlFor="official_url">官方网站</label><input className="input" id="official_url" name="official_url" type="url" defaultValue={item?.official_url || ""} required /></div>
          <div className="field"><label htmlFor="source_url">本条信息来源</label><input className="input" id="source_url" name="source_url" type="url" defaultValue={item?.source_url || ""} required /></div>
          <div className="field"><label htmlFor="verified_at">最后核验日期</label><input className="input" id="verified_at" name="verified_at" type="date" defaultValue={dateValue(item?.verified_at)} /></div>
        </div>
        <div style={{ display: "grid", gap: "var(--space-lg)" }}>
          <div className="field"><label htmlFor="audience">适用人群（逗号分隔）</label><input className="input" id="audience" name="audience" defaultValue={item?.audience.join("，") || "大学生"} required /></div>
          <div className="field"><label htmlFor="categories">方向标签（逗号分隔）</label><input className="input" id="categories" name="categories" defaultValue={item?.categories.join("，") || ""} required /></div>
          <div className="field"><label htmlFor="level">层级/认可范围</label><input className="input" id="level" name="level" defaultValue={item?.level || "行业认可"} required /></div>
          <div className="field"><label htmlFor="region">地区</label><input className="input" id="region" name="region" defaultValue={item?.region || "不限"} required /></div>
          <div className="field"><label htmlFor="format">形式</label><input className="input" id="format" name="format" defaultValue={item?.format || "以官网为准"} required /></div>
        </div>
      </section>

      <section className="filter-form" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        <div className="field"><label htmlFor="registration_start">报名开始</label><input className="input" id="registration_start" name="registration_start" type="date" defaultValue={dateValue(item?.registration_start)} /></div>
        <div className="field"><label htmlFor="registration_end">报名截止</label><input className="input" id="registration_end" name="registration_end" type="date" defaultValue={dateValue(item?.registration_end)} /></div>
        <div className="field"><label htmlFor="event_start">活动/考试开始</label><input className="input" id="event_start" name="event_start" type="date" defaultValue={dateValue(item?.event_start)} /></div>
        <div className="field"><label htmlFor="event_end">活动/考试结束</label><input className="input" id="event_end" name="event_end" type="date" defaultValue={dateValue(item?.event_end)} /></div>
      </section>

      <section style={{ display: "grid", gap: "var(--space-lg)" }}>
        <div className="field"><label htmlFor="schedule_note">时间说明</label><textarea className="textarea" id="schedule_note" name="schedule_note" defaultValue={item?.schedule_note || "具体时间以官网最新公告为准"} required /></div>
        <div className="field"><label htmlFor="recognition">认可与特点</label><textarea className="textarea" id="recognition" name="recognition" defaultValue={item?.recognition || ""} required /></div>
        <div className="field"><label htmlFor="recommendation">推荐理由</label><textarea className="textarea" id="recommendation" name="recommendation" defaultValue={item?.recommendation || ""} required /></div>
        <div className="filter-form" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          <div className="field"><label htmlFor="fee">费用</label><input className="input" id="fee" name="fee" defaultValue={item?.fee || ""} /></div>
          <div className="field"><label htmlFor="team_size">团队/报名要求</label><input className="input" id="team_size" name="team_size" defaultValue={item?.team_size || ""} /></div>
        </div>
      </section>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-lg)" }}>
        <label><input name="featured" type="checkbox" defaultChecked={item?.featured} /> 设为精选</label>
        <label><input name="published" type="checkbox" defaultChecked={item?.published} /> 立即发布</label>
        <button className="button button--accent" data-state={pending ? "loading" : undefined} disabled={pending} type="submit">{pending ? "正在保存…" : item ? "保存修改" : "创建条目"}</button>
      </div>
    </form>
  );
}
