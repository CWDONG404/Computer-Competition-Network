import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ccn.cwdzone.top";
  const staticPages: MetadataRoute.Sitemap = ["", "/directory", "/calendar", "/platforms", "/about"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path ? "weekly" : "daily",
    priority: path ? 0.8 : 1
  }));
  try {
    const rows = await db()< { slug: string; updated_at: Date }[]>`SELECT slug, updated_at FROM listings WHERE published = TRUE`;
    return [...staticPages, ...rows.map((item) => ({ url: `${siteUrl}/directory/${item.slug}`, lastModified: item.updated_at, changeFrequency: "weekly" as const, priority: 0.7 }))];
  } catch {
    return staticPages;
  }
}
