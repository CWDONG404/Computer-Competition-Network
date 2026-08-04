"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const navigation = [
  ["目录", "/directory"],
  ["日历", "/calendar"],
  ["机会平台", "/platforms"],
  ["收录标准", "/about"]
] as const;

export function SiteHeader() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const openSearch = () => {
    dialogRef.current?.showModal();
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="site-header">
      <div className="shell header-row">
        <Link className="brand" href="/" aria-label="CCN 技术赛事情报台首页">
          <strong>CCN</strong><span>技术赛事情报台</span>
        </Link>
        <nav className="desktop-nav" aria-label="主导航">
          {navigation.map(([label, href]) => <Link className="nav-link" href={href} key={href}>{label}</Link>)}
        </nav>
        <div className="header-actions">
          <button className="search-trigger" type="button" onClick={openSearch} aria-label="打开全站搜索">
            <span aria-hidden="true">⌕</span><span className="search-trigger__label">搜索</span><kbd>Ctrl K</kbd>
          </button>
          <Link className="admin-link" href="/admin">后台</Link>
          <button
            className="mobile-menu-button"
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "关闭菜单" : "打开菜单"}
            onClick={() => setMobileOpen((value) => !value)}
          >
            <span aria-hidden="true">{mobileOpen ? "×" : "≡"}</span>
          </button>
        </div>
      </div>
      <nav id="mobile-menu" className={`shell mobile-drawer ${mobileOpen ? "is-open" : ""}`} aria-label="移动端导航">
        {navigation.map(([label, href]) => <Link href={href} key={href} onClick={() => setMobileOpen(false)}>{label}</Link>)}
        <Link href="/admin" onClick={() => setMobileOpen(false)}>管理后台</Link>
      </nav>

      <dialog className="search-dialog" ref={dialogRef} onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current?.close();
      }}>
        <div className="search-dialog__panel">
          <div className="search-dialog__head">
            <div><span className="eyebrow">全站检索</span><strong>找比赛、证书或主办方</strong></div>
            <button type="button" className="icon-button" onClick={() => dialogRef.current?.close()} aria-label="关闭搜索">×</button>
          </div>
          <form className="search-dialog__form" action="/directory" method="get">
            <label className="sr-only" htmlFor="global-search">搜索关键词</label>
            <input ref={inputRef} className="input" id="global-search" name="q" placeholder="例如：ICPC、Kubernetes、网络安全" autoComplete="off" />
            <button className="button button--primary" type="submit">搜索目录</button>
          </form>
          <div className="quick-links" aria-label="快捷入口">
            <Link href="/directory?audience=大学生">大学生项目</Link>
            <Link href="/directory?audience=在职">在职认证</Link>
            <Link href="/directory?status=open&sort=deadline">临近截止</Link>
            <Link href="/platforms">持续机会平台</Link>
          </div>
        </div>
      </dialog>
    </header>
  );
}
