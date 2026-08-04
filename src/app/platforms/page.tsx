import type { Metadata } from "next";
import { ListingCard } from "@/components/ListingCard";
import { getPlatforms } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "持续机会平台", description: "Kaggle、天池、Devpost 等持续发布比赛或黑客松的平台入口。" };

export default async function PlatformsPage() {
  const platforms = await getPlatforms();
  return (
    <div className="shell">
      <header className="page-head">
        <div><p className="eyebrow">聚合入口</p><h1>持续机会平台</h1></div>
        <p>平台会持续发布不同活动，但平台本身不是一场具体比赛，因此单独保存且不计入 70 场比赛。</p>
      </header>
      <section className="section-block" style={{ borderTop: 0 }}>
        <div className="panel">{platforms.length ? platforms.map((item) => <ListingCard item={item} key={item.id} />) : <div className="empty-state">平台资料正在整理。</div>}</div>
      </section>
    </div>
  );
}
