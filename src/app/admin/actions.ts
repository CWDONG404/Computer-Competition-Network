"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formDataToListing } from "@/lib/validation";
import { evidenceLabels, type EvidenceCode } from "@/types/listing";

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

  const allowedEvidenceCodes = new Set(Object.keys(evidenceLabels) as EvidenceCode[]);
  const evidenceCodes = [...new Set(
    formData.getAll("evidence_codes").filter((value): value is EvidenceCode =>
      typeof value === "string" && allowedEvidenceCodes.has(value as EvidenceCode)
    )
  )];
  if (item.published && (!item.verified_at || evidenceCodes.length === 0)) {
    return { error: "发布前必须填写核验日期，并至少选择一项可追溯的认可证据。" };
  }

  const sql = db();
  try {
    await sql.begin(async (tx) => {
      let listingId = parsedId;
      if (parsedId) {
        await tx`
          UPDATE listings SET
            kind=${item.kind}, slug=${item.slug}, title=${item.title}, short_title=${item.short_title},
            summary=${item.summary}, organizer=${item.organizer}, official_url=${item.official_url}, source_url=${item.source_url},
            audience=${tx.array(item.audience)}, categories=${tx.array(item.categories)}, level=${item.level}, format=${item.format},
            region=${item.region}, registration_start=${item.registration_start}, registration_end=${item.registration_end},
            event_start=${item.event_start}, event_end=${item.event_end}, schedule_note=${item.schedule_note},
            recognition=${item.recognition}, recommendation=${item.recommendation}, fee=${item.fee}, team_size=${item.team_size},
            status=${item.status}, cycle_type=${item.cycle_type}, eligibility=${item.eligibility}, language=${item.language},
            validity_period=${item.validity_period}, next_review_at=${item.next_review_at}, featured=${item.featured},
            published=${item.published}, verified_at=${item.verified_at}, catalog_managed=FALSE
          WHERE id=${parsedId}
        `;
      } else {
        const inserted = await tx<{ id: number }[]>`
          INSERT INTO listings (
            kind, slug, title, short_title, summary, organizer, official_url, source_url, audience, categories,
            level, format, region, registration_start, registration_end, event_start, event_end, schedule_note,
            recognition, recommendation, fee, team_size, status, cycle_type, eligibility, language, validity_period,
            next_review_at, featured, published, verified_at, catalog_managed
          ) VALUES (
            ${item.kind}, ${item.slug}, ${item.title}, ${item.short_title}, ${item.summary}, ${item.organizer},
            ${item.official_url}, ${item.source_url}, ${tx.array(item.audience)}, ${tx.array(item.categories)},
            ${item.level}, ${item.format}, ${item.region}, ${item.registration_start}, ${item.registration_end},
            ${item.event_start}, ${item.event_end}, ${item.schedule_note}, ${item.recognition}, ${item.recommendation},
            ${item.fee}, ${item.team_size}, ${item.status}, ${item.cycle_type}, ${item.eligibility}, ${item.language},
            ${item.validity_period}, ${item.next_review_at}, ${item.featured}, ${item.published}, ${item.verified_at}, FALSE
          ) RETURNING id
        `;
        listingId = inserted[0].id;
      }

      await tx`UPDATE listing_sources SET active=FALSE WHERE listing_id=${listingId} AND role IN ('official', 'rules')`;
      const officialSource = await tx<{ id: number }[]>`
        INSERT INTO listing_sources (listing_id, role, title, url, monitor_mode, active, next_check_at)
        VALUES (${listingId}, 'official', '官方网站', ${item.official_url}, 'http', TRUE, NOW())
        ON CONFLICT (listing_id, role, url) DO UPDATE SET
          title=EXCLUDED.title, active=TRUE, next_check_at=NOW(), last_error=NULL
        RETURNING id
      `;
      if (item.source_url !== item.official_url) {
        await tx`
          INSERT INTO listing_sources (listing_id, role, title, url, monitor_mode, active, next_check_at)
          VALUES (${listingId}, 'rules', '资料与规则来源', ${item.source_url}, 'http', TRUE, NOW())
          ON CONFLICT (listing_id, role, url) DO UPDATE SET
            title=EXCLUDED.title, active=TRUE, next_check_at=NOW(), last_error=NULL
        `;
      }

      await tx`DELETE FROM listing_evidence WHERE listing_id=${listingId}`;
      for (const code of evidenceCodes) {
        await tx`
          INSERT INTO listing_evidence (listing_id, source_id, code, label, note)
          VALUES (${listingId}, ${officialSource[0].id}, ${code}, ${evidenceLabels[code]}, '管理员依据所关联的一手来源核验')
        `;
      }
    });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("listings_slug_key") ? "Slug 已存在，请换一个。" : "保存失败，请稍后重试。";
    return { error: message };
  }

  revalidatePath("/");
  revalidatePath("/directory");
  revalidatePath("/calendar");
  revalidatePath("/platforms");
  redirect("/admin?saved=1");
}

export async function togglePublishedAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id < 1) return;
  const sql = db();
  const rows = await sql<{
    published: boolean;
    verified_at: string | null;
    has_official_source: boolean;
    has_evidence: boolean;
  }[]>`
    SELECT l.published, l.verified_at,
      EXISTS (SELECT 1 FROM listing_sources s WHERE s.listing_id=l.id AND s.role='official' AND s.active=TRUE) AS has_official_source,
      EXISTS (SELECT 1 FROM listing_evidence e WHERE e.listing_id=l.id) AS has_evidence
    FROM listings l WHERE l.id=${id} LIMIT 1
  `;
  const listing = rows[0];
  if (!listing) return;
  if (!listing.published && (!listing.verified_at || !listing.has_official_source || !listing.has_evidence)) {
    redirect("/admin?publish_error=1");
  }
  await sql`UPDATE listings SET published=${!listing.published} WHERE id=${id}`;
  revalidatePath("/");
  revalidatePath("/directory");
  revalidatePath("/calendar");
  revalidatePath("/platforms");
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
