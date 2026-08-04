import type { Metadata } from "next";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/noto-sans-sc";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ccn.cwdzone.top";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "CCN 技术赛事情报台", template: "%s｜CCN 技术赛事情报台" },
  description: "收集适合大学生与在职人群的高质量计算机比赛、黑客松和职业证书，标注时间、适用人群与官方来源。",
  openGraph: {
    title: "CCN 技术赛事情报台",
    description: "70 场比赛、50 项证书，按时间、资格和证据筛选。",
    type: "website",
    locale: "zh_CN",
    url: siteUrl
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <a className="skip-link" href="#main">跳到主要内容</a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
