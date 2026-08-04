import type { Metadata } from "next";
import "@fontsource-variable/newsreader";
import "@fontsource-variable/ibm-plex-sans";
import "@fontsource/ibm-plex-mono/400.css";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ccn.cwdzone.top";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "竞赛与证书资料库", template: "%s｜竞赛与证书资料库" },
  description: "收集适合大学生与在职人群的高质量计算机比赛、黑客松和职业证书，标注时间、适用人群与官方来源。",
  openGraph: {
    title: "竞赛与证书资料库",
    description: "先看时间与门槛，再决定投入。",
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
