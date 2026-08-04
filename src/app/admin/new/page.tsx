import { ListingForm } from "@/components/ListingForm";
import { requireAdmin } from "@/lib/auth";

export default async function NewListingPage() {
  await requireAdmin();
  return <div className="shell"><header className="page-head"><div><p className="eyebrow">New entry</p><h1>新增资料</h1></div><p>先保存为草稿，核对官网来源和时间后再发布。</p></header><ListingForm /></div>;
}
