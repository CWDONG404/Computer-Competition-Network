import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <p className="footer-wordmark">竞赛与证书资料库</p>
        <div className="foot-dense">
          <p>
            一个面向中文学习者的独立信息索引。本站只整理主办方公开信息，并以官网链接作为最终依据；“推荐理由”是编辑性说明，不等同于官方评级、就业承诺或报考建议。所有时间均可能调整，请在报名或付费前再次核验。
          </p>
          <nav className="footer-links" aria-label="页脚导航">
            <Link href="/directory">完整目录</Link>
            <Link href="/about">收录标准</Link>
            <Link href="/admin">后台</Link>
            <a href="https://github.com/CWDONG404/Computer-Competition-Network" rel="noreferrer" target="_blank">GitHub ↗</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
