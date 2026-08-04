import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getReviewItems } from "@/lib/db";
import { resolveReviewAction } from "./actions";

export const dynamic = "force-dynamic";

const typeLabels = {
  content_changed: "页面变化",
  check_failed: "核验失败",
  stale: "资料到期"
} as const;

export default async function ReviewPage() {
  await requireAdmin();
  const items = await getReviewItems("pending");
  return (
    <div className="shell admin-workbench">
      <header className="page-head page-head--compact">
        <div>
          <p className="eyebrow">Review inbox</p>
          <h1>待审箱</h1>
          <p>监测只生成任务，不会自动更新公开资料。确认后请进入编辑页人工修改并发布。</p>
        </div>
        <Link className="button" href="/admin">返回资料管理</Link>
      </header>

      <div className="review-list">
        {items.length === 0 && <div className="empty-state">当前没有待审任务。</div>}
        {items.map((item) => (
          <article className="review-item" key={item.id}>
            <div className="review-item__meta">
              <span className="tag">{typeLabels[item.type]}</span>
              <time>{new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Shanghai" }).format(new Date(item.detected_at))}</time>
            </div>
            <h2>{item.listing_title || "未关联条目"}</h2>
            <p>{item.summary}</p>
            {item.source_url && <a className="text-link" href={item.source_url} target="_blank" rel="noreferrer">查看来源：{item.source_title || item.source_url}</a>}
            <form action={resolveReviewAction} className="review-actions">
              <input type="hidden" name="id" value={item.id} />
              <input className="input" name="note" aria-label="处理备注" placeholder="可选：记录判断依据" />
              {item.listing_id && <Link className="button" href={`/admin/${item.listing_id}/edit`}>编辑条目</Link>}
              <button className="button button--primary" type="submit" name="decision" value="accepted">标记已复核</button>
              <button className="button" type="submit" name="decision" value="dismissed">忽略变化</button>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
