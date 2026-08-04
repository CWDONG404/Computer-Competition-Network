import { notFound } from "next/navigation";
import { ListingForm } from "@/components/ListingForm";
import { requireAdmin } from "@/lib/auth";
import { getListingById } from "@/lib/db";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const item = await getListingById(Number(id));
  if (!item) notFound();
  return <div className="shell"><header className="page-head"><div><p className="eyebrow">Edit entry</p><h1>编辑资料</h1></div><p>修改公开信息时同步更新“最后核验日期”，便于后续复查。</p></header><ListingForm item={item} /></div>;
}
