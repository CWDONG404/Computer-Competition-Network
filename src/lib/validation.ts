import { z } from "zod";

const emptyToNull = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") return null;
  return value;
};

export const listingSchema = z.object({
  kind: z.enum(["competition", "certification"]),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug 只能包含小写字母、数字和连字符"),
  title: z.string().trim().min(2).max(160),
  short_title: z.preprocess(emptyToNull, z.string().trim().max(60).nullable()),
  summary: z.string().trim().min(10).max(500),
  organizer: z.string().trim().min(2).max(160),
  official_url: z.url(),
  source_url: z.url(),
  audience: z.string().transform((v) => v.split(/[，,]/).map((x) => x.trim()).filter(Boolean)),
  categories: z.string().transform((v) => v.split(/[，,]/).map((x) => x.trim()).filter(Boolean)),
  level: z.string().trim().min(2).max(80),
  format: z.string().trim().min(2).max(100),
  region: z.string().trim().min(1).max(80),
  registration_start: z.preprocess(emptyToNull, z.iso.date().nullable()),
  registration_end: z.preprocess(emptyToNull, z.iso.date().nullable()),
  event_start: z.preprocess(emptyToNull, z.iso.date().nullable()),
  event_end: z.preprocess(emptyToNull, z.iso.date().nullable()),
  schedule_note: z.string().trim().min(4).max(500),
  recognition: z.string().trim().min(8).max(500),
  recommendation: z.string().trim().min(8).max(500),
  fee: z.preprocess(emptyToNull, z.string().trim().max(100).nullable()),
  team_size: z.preprocess(emptyToNull, z.string().trim().max(100).nullable()),
  status: z.enum(["open", "upcoming", "year_round", "awaiting", "closed"]),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  verified_at: z.preprocess(emptyToNull, z.iso.date().nullable())
});

export function formDataToListing(formData: FormData) {
  return listingSchema.parse({
    ...Object.fromEntries(formData.entries()),
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on"
  });
}
