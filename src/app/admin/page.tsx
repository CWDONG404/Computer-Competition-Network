import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { findListings } from "@/lib/db";
import { deleteListingAction, logoutAction, togglePublishedAction } from "./actions";
import { DeleteButton } from "@/components/DeleteButton";
import { kindLabels, statusLabels } from "@/types/listing";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const { items, total } = await findListings({ pageSize: 100 }, true);
  return (
    <div className="shell" style={{ paddingBottom: "var(--space-3xl)" }}>
      <header className="page-head">
        <div><p className="eyebrow">Editorial desk</p><h1>资料管理</h1></div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-sm)", justifyContent: "flex-end" }}>
          <Link className="button button--accent" href="/admin/new">新增条目</Link>
          <form action={logoutAction}><button className="button" type="submit">退出登录</button></form>
        </div>
      </header>
      {params.saved && <div className="notice" style={{ marginBottom: "var(--space-lg)" }}>条目已保存。</div>}
      {params.deleted && <div className="notice" style={{ marginBottom: "var(--space-lg)" }}>条目已删除。</div>}
      <p className="mono muted">共 {total} 条，含草稿。</p>
      <div style={{ borderTop: "2px solid var(--color-ink)" }}>
        {items.map((item) => (
          <article key={item.id} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "var(--space-lg)", paddingBlock: "var(--space-lg)", borderBottom: "1px solid var(--color-rule)" }}>
            <div>
              <div className="card-meta" style={{ justifyContent: "flex-start", gap: "var(--space-md)" }}><span>{kindLabels[item.kind]}</span><span>{statusLabels[item.status]}</span><span>{item.published ? "已发布" : "草稿"}</span></div>
              <h2 style={{ margin: "var(--space-xs) 0", fontFamily: "var(--font-display)", fontStyle: "normal" }}>{item.title}</h2>
              <p className="muted" style={{ margin: 0 }}>{item.organizer}</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "flex-end", gap: "var(--space-sm)" }}>
              <Link className="button" href={`/admin/${item.id}/edit`}>编辑</Link>
              <form action={togglePublishedAction}><input type="hidden" name="id" value={item.id} /><button className="button" type="submit">{item.published ? "转为草稿" : "发布"}</button></form>
              <form action={deleteListingAction}><input type="hidden" name="id" value={item.id} /><DeleteButton /></form>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
