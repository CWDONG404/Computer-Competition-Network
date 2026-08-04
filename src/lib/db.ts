import postgres, { type Sql } from "postgres";
import type { Listing, ListingKind, ListingStatus } from "@/types/listing";

let client: Sql | undefined;

export function db() {
  if (!client) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error("缺少 DATABASE_URL");
    client = postgres(databaseUrl, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      transform: { undefined: null }
    });
  }
  return client;
}

export async function getHomeData() {
  const sql = db();
  const [featured, latest, counts, categories] = await Promise.all([
    sql<Listing[]>`SELECT * FROM listings WHERE published = TRUE AND featured = TRUE ORDER BY updated_at DESC LIMIT 6`,
    sql<Listing[]>`SELECT * FROM listings WHERE published = TRUE ORDER BY updated_at DESC LIMIT 8`,
    sql<{ kind: ListingKind; count: number }[]>`
      SELECT kind, COUNT(*)::int AS count FROM listings WHERE published = TRUE GROUP BY kind
    `,
    sql<{ category: string; count: number }[]>`
      SELECT category, COUNT(*)::int AS count
      FROM listings, UNNEST(categories) AS category
      WHERE published = TRUE
      GROUP BY category ORDER BY count DESC, category ASC LIMIT 10
    `
  ]);
  return { featured, latest, counts, categories };
}

export interface ListingFilters {
  q?: string;
  kind?: ListingKind;
  status?: ListingStatus;
  audience?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

export async function findListings(filters: ListingFilters = {}, includeDrafts = false) {
  const sql = db();
  const q = filters.q?.trim() || null;
  const kind = filters.kind || null;
  const status = filters.status || null;
  const audience = filters.audience?.trim() || null;
  const category = filters.category?.trim() || null;
  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize || 18));
  const offset = (page - 1) * pageSize;
  const publishedOnly = !includeDrafts;

  const [items, total] = await Promise.all([
    sql<Listing[]>`
      SELECT * FROM listings
      WHERE (${publishedOnly} = FALSE OR published = TRUE)
        AND (${kind}::text IS NULL OR kind = ${kind})
        AND (${status}::text IS NULL OR status = ${status})
        AND (${audience}::text IS NULL OR ${audience} = ANY(audience))
        AND (${category}::text IS NULL OR ${category} = ANY(categories))
        AND (
          ${q}::text IS NULL
          OR title ILIKE ${q ? `%${q}%` : null}
          OR COALESCE(short_title, '') ILIKE ${q ? `%${q}%` : null}
          OR organizer ILIKE ${q ? `%${q}%` : null}
          OR summary ILIKE ${q ? `%${q}%` : null}
        )
      ORDER BY featured DESC,
        CASE status WHEN 'open' THEN 1 WHEN 'upcoming' THEN 2 WHEN 'year_round' THEN 3 WHEN 'awaiting' THEN 4 ELSE 5 END,
        registration_end ASC NULLS LAST, updated_at DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `,
    sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count FROM listings
      WHERE (${publishedOnly} = FALSE OR published = TRUE)
        AND (${kind}::text IS NULL OR kind = ${kind})
        AND (${status}::text IS NULL OR status = ${status})
        AND (${audience}::text IS NULL OR ${audience} = ANY(audience))
        AND (${category}::text IS NULL OR ${category} = ANY(categories))
        AND (
          ${q}::text IS NULL
          OR title ILIKE ${q ? `%${q}%` : null}
          OR COALESCE(short_title, '') ILIKE ${q ? `%${q}%` : null}
          OR organizer ILIKE ${q ? `%${q}%` : null}
          OR summary ILIKE ${q ? `%${q}%` : null}
        )
    `
  ]);

  return { items, total: total[0]?.count ?? 0, page, pageSize };
}

export async function getListingBySlug(slug: string, includeDrafts = false) {
  const sql = db();
  const rows = await sql<Listing[]>`
    SELECT * FROM listings WHERE slug = ${slug} AND (${includeDrafts} = TRUE OR published = TRUE) LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function getListingById(id: number) {
  const sql = db();
  const rows = await sql<Listing[]>`SELECT * FROM listings WHERE id = ${id} LIMIT 1`;
  return rows[0] ?? null;
}

export async function getTaxonomy() {
  const sql = db();
  const [audiences, categories] = await Promise.all([
    sql<{ value: string }[]>`SELECT DISTINCT UNNEST(audience) AS value FROM listings WHERE published = TRUE ORDER BY value`,
    sql<{ value: string }[]>`SELECT DISTINCT UNNEST(categories) AS value FROM listings WHERE published = TRUE ORDER BY value`
  ]);
  return { audiences: audiences.map((x) => x.value), categories: categories.map((x) => x.value) };
}

export async function healthcheck() {
  const sql = db();
  const result = await sql<{ ok: number }[]>`SELECT 1 AS ok`;
  return result[0]?.ok === 1;
}
