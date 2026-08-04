import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="shell" style={{ paddingBlock: "var(--space-4xl)" }}>
      <p className="eyebrow">404</p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-display-s)", fontStyle: "normal" }}>没有找到这条资料</h1>
      <p className="lede">它可能仍是草稿、已经归档，或链接地址发生了变化。</p>
      <Link className="button button--accent" href="/directory">返回完整目录</Link>
    </div>
  );
}
