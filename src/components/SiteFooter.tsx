import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-row">
        <p><strong>CCN</strong> 独立技术情报索引 · 报名与付费前请再次核验官网</p>
        <nav className="footer-links" aria-label="页脚导航">
          <Link href="/directory">目录</Link>
          <Link href="/calendar">日历</Link>
          <Link href="/about">方法</Link>
          <a href="https://github.com/CWDONG404/Computer-Competition-Network" rel="noreferrer" target="_blank">GitHub ↗</a>
        </nav>
      </div>
    </footer>
  );
}
