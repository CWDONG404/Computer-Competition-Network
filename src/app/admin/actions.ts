"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formDataToListing } from "@/lib/validation";

export interface FormState { error?: string; fieldErrors?: Record<string, string[]> }

export async function saveListingAction(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsedId = Number(formData.get("id") || 0);
  let item;
  try {
    item = formDataToListing(formData);
  } catch (error) {
    const flattened = (error as { flatten?: () => { fieldErrors: Record<string, string[]> } }).flatten?.();
    return { error: "请检查表单中的必填项和格式。", fieldErrors: flattened?.fieldErrors };
  }

  const sql = db();
  try {
    if (parsedId) {
      await sql`
        UPDATE listings SET
          kind=${item.kind}, slug=${item.slug}, title=${item.title}, short_title=${item.short_title},
          summary=${item.summary}, organizer=${item.organizer}, official_url=${item.official_url}, source_url=${item.source_url},
          audience=${sql.array(item.audience)}, categories=${sql.array(item.categories)}, level=${item.level}, format=${item.format},
          region=${item.region}, registration_start=${item.registration_start}, registration_end=${item.registration_end},
          event_start=${item.event_start}, event_end=${item.event_end}, schedule_note=${item.schedule_note},
          recognition=${item.recognition}, recommendation=${item.recommendation}, fee=${item.fee}, team_size=${item.team_size},
          status=${item.status}, featured=${item.featured}, published=${item.published}, verified_at=${item.verified_at}
        WHERE id=${parsedId}
      `;
    } else {
      await sql`
        INSERT INTO listings (
          kind, slug, title, short_title, summary, organizer, official_url, source_url, audience, categories,
          level, format, region, registration_start, registration_end, event_start, event_end, schedule_note,
          recognition, recommendation, fee, team_size, status, featured, published, verified_at
        ) VALUES (
          ${item.kind}, ${item.slug}, ${item.title}, ${item.short_title}, ${item.summary}, ${item.organizer},
          ${item.official_url}, ${item.source_url}, ${sql.array(item.audience)}, ${sql.array(item.categories)},
          ${item.level}, ${item.format}, ${item.region}, ${item.registration_start}, ${item.registration_end},
          ${item.event_start}, ${item.event_end}, ${item.schedule_note}, ${item.recognition}, ${item.recommendation},
          ${item.fee}, ${item.team_size}, ${item.status}, ${item.featured}, ${item.published}, ${item.verified_at}
        )
      `;
    }
  } catch (error) {
    const message = error instanceof Error && error.message.includes("listings_slug_key") ? "Slug 已存在，请换一个。" : "保存失败，请稍后重试。";
    return { error: message };
  }

  revalidatePath("/");
  revalidatePath("/directory");
  redirect("/admin?saved=1");
}

export async function togglePublishedAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id < 1) return;
  const sql = db();
  await sql`UPDATE listings SET published = NOT published WHERE id = ${id}`;
  revalidatePath("/");
  revalidatePath("/directory");
  revalidatePath("/admin");
}

export async function deleteListingAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id < 1) return;
  const sql = db();
  await sql`DELETE FROM listings WHERE id = ${id}`;
  revalidatePath("/");
  revalidatePath("/directory");
  redirect("/admin?deleted=1");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}
