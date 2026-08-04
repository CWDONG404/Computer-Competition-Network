"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const groups = [
  {
    title: "按类型",
    items: [
      ["全部比赛", "/directory?kind=competition", "算法、黑客松、安全与工程"],
      ["全部考证", "/directory?kind=certification", "职业资格与厂商认证"]
    ]
  },
  {
    title: "按人群",
    items: [
      ["大学生", "/directory?audience=大学生", "高校可参与项目"],
      ["在职人群", "/directory?audience=在职", "职业发展与技术认证"]
    ]
  },
  {
    title: "按状态",
    items: [
      ["报名中", "/directory?status=open", "正在接受报名"],
      ["全年可参与", "/directory?status=year_round", "滚动开放的平台与认证"]
    ]
  }
] as const;

export function SiteHeader() {
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = () => {
    if (timer.current) clearTimeout(timer.current);
    setMegaOpen(true);
  };
  const closeSoon = () => {
    timer.current = setTimeout(() => setMegaOpen(false), 160);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMegaOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="site-header">
        <div className="shell header-row">
          <Link className="brand" href="/" aria-label="竞赛与证书资料库首页">
            <strong>竞赛与证书资料库</strong>
            <span>CCN</span>
          </Link>
          <nav className="desktop-nav" aria-label="主导航">
            <div onMouseEnter={open} onMouseLeave={closeSoon}>
              <button
                className={`nav-trigger ${megaOpen ? "is-open" : ""}`}
                aria-expanded={megaOpen}
                aria-controls="discovery-menu"
                onClick={() => setMegaOpen((value) => !value)}
              >
                浏览资料 ↓
              </button>
            </div>
            <Link className="nav-link" href="/directory?kind=competition">比赛</Link>
            <Link className="nav-link" href="/directory?kind=certification">考证</Link>
            <Link className="nav-link" href="/about">收录标准</Link>
          </nav>
          <div className="header-actions">
            <Link className="nav-link" href="/admin">管理后台</Link>
            <Link className="button button--accent" href="/directory">查看全部</Link>
            <button
              className="mobile-menu-button"
              type="button"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "关闭菜单" : "打开菜单"}
              onClick={() => setMobileOpen((value) => !value)}
            >
              {mobileOpen ? "×" : "≡"}
            </button>
          </div>
        </div>
        <div
          id="discovery-menu"
          className={`mega-panel ${megaOpen ? "is-open" : ""}`}
          onMouseEnter={open}
          onMouseLeave={closeSoon}
        >
          <div className="shell mega-inner">
            {groups.map((group) => (
              <section className="mega-group" key={group.title}>
                <h2>{group.title}</h2>
                {group.items.map(([label, href, description]) => (
                  <Link className="mega-item" href={href} key={href} onClick={() => setMegaOpen(false)}>
                    <b>{label}</b><span>{description}</span>
                  </Link>
                ))}
              </section>
            ))}
            <Link className="mega-feature" href="/directory" onClick={() => setMegaOpen(false)}>
              <span>完整目录 →</span>
              <strong>先看时间，<br />再决定投入。</strong>
            </Link>
          </div>
        </div>
        <nav id="mobile-menu" className={`shell mobile-drawer ${mobileOpen ? "is-open" : ""}`} aria-label="移动端导航">
          <Link href="/directory" onClick={() => setMobileOpen(false)}>全部资料</Link>
          <Link href="/directory?kind=competition" onClick={() => setMobileOpen(false)}>比赛</Link>
          <Link href="/directory?kind=certification" onClick={() => setMobileOpen(false)}>考证</Link>
          <Link href="/about" onClick={() => setMobileOpen(false)}>收录标准</Link>
          <Link href="/admin" onClick={() => setMobileOpen(false)}>管理后台</Link>
        </nav>
      </header>
      <button className={`nav-scrim ${megaOpen ? "is-active" : ""}`} aria-label="关闭菜单" tabIndex={megaOpen ? 0 : -1} onClick={() => setMegaOpen(false)} />
    </>
  );
}
