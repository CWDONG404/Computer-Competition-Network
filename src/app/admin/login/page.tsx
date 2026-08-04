import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = { title: "管理员登录", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return (
    <div className="shell" style={{ maxWidth: "42rem", paddingBlock: "var(--space-3xl)" }}>
      <p className="eyebrow">Private editorial desk</p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontStyle: "normal", marginBottom: "var(--space-sm)" }}>管理员登录</h1>
      <p className="muted" style={{ marginBottom: "var(--space-xl)" }}>只有管理员可以新增、核验和发布条目。</p>
      <LoginForm />
    </div>
  );
}
