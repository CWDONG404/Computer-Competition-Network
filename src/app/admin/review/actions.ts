"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function resolveReviewAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const decision = formData.get("decision");
  const note = String(formData.get("note") || "").trim().slice(0, 500) || null;
  if (!Number.isInteger(id) || id < 1) return;
  if (decision !== "accepted" && decision !== "dismissed") return;
  const sql = db();
  await sql`
    UPDATE review_items SET status = ${decision}, reviewed_at = NOW(), review_note = ${note}
    WHERE id = ${id} AND status = 'pending'
  `;
  revalidatePath("/admin/review");
}
