import postgres, { type Sql } from "postgres";
import type {
  ListingDetails,
  ListingEditorDetails,
  ListingEvent,
  ListingKind,
  ListingSource,
  ListingStatus,
  ListingWithEvidence,
  ReviewItem
} from "@/types/listing";
import type { CertificationProfile, CompetitionProfile, ListingProfiles, PlatformProfile } from "@/features/catalog/types";

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
  const [deadlines, rolling, latest, counts, tracks, pending] = await Promise.all([
    sql<ListingWithEvidence[]>`
      SELECT l.*,
        COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id', e.id, 'listing_id', e.listing_id, 'source_id', e.source_id,
            'code', e.code, 'label', e.label, 'note', e.note, 'source_url', s.url
          ) ORDER BY e.id)
          FROM listing_evidence e LEFT JOIN listing_sources s ON s.id = e.source_id
          WHERE e.listing_id = l.id
        ), '[]'::jsonb) AS evidence
      FROM listings l
      WHERE l.published = TRUE AND l.kind = 'competition'
        AND l.status IN ('open', 'upcoming')
      ORDER BY l.registration_end ASC NULLS LAST, l.event_start ASC NULLS LAST, l.featured DESC
      LIMIT 8
    `,
    sql<ListingWithEvidence[]>`
      SELECT l.*,
        COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id', e.id, 'listing_id', e.listing_id, 'source_id', e.source_id,
            'code', e.code, 'label', e.label, 'note', e.note, 'source_url', s.url
          ) ORDER BY e.id)
          FROM listing_evidence e LEFT JOIN listing_sources s ON s.id = e.source_id
          WHERE e.listing_id = l.id
        ), '[]'::jsonb) AS evidence
      FROM listings l
      WHERE l.published = TRUE AND l.kind IN ('competition', 'certification')
        AND (l.status = 'year_round' OR l.cycle_type IN ('rolling', 'on_demand'))
      ORDER BY l.featured DESC, l.verified_at DESC NULLS LAST, l.title ASC
      LIMIT 6
    `,
    sql<ListingWithEvidence[]>`
      SELECT l.*,
        COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id', e.id, 'listing_id', e.listing_id, 'source_id', e.source_id,
            'code', e.code, 'label', e.label, 'note', e.note, 'source_url', s.url
          ) ORDER BY e.id)
          FROM listing_evidence e LEFT JOIN listing_sources s ON s.id = e.source_id
          WHERE e.listing_id = l.id
        ), '[]'::jsonb) AS evidence
      FROM listings l
      WHERE l.published = TRUE AND l.kind IN ('competition', 'certification')
      ORDER BY l.verified_at DESC NULLS LAST, l.updated_at DESC
      LIMIT 8
    `,
    sql<{ kind: ListingKind; count: number }[]>`
      SELECT kind, COUNT(*)::int AS count
      FROM listings WHERE published = TRUE AND kind IN ('competition', 'certification')
      GROUP BY kind
    `,
    sql<{ track: string; count: number }[]>`
      SELECT track, COUNT(*)::int AS count
      FROM listings, UNNEST(categories) AS track
      WHERE published = TRUE AND kind IN ('competition', 'certification')
      GROUP BY track ORDER BY count DESC, track ASC
    `,
    sql<{ count: number }[]>`SELECT COUNT(*)::int AS count FROM review_items WHERE status = 'pending'`
  ]);

  return { deadlines, rolling, latest, counts, tracks, pendingReviews: pending[0]?.count ?? 0 };
}

export type ListingSort = "deadline" | "recently_verified" | "recognition";

export interface ListingFilters {
  q?: string;
  kind?: ListingKind;
  status?: ListingStatus;
  audience?: string;
  track?: string;
  recognition?: string;
  sort?: ListingSort;
  page?: number;
  pageSize?: number;
}

export async function findListings(filters: ListingFilters = {}, includeDrafts = false) {
  const sql = db();
  const q = filters.q?.trim() || null;
  const kind = filters.kind || null;
  const status = filters.status || null;
  const audience = filters.audience?.trim() || null;
  const track = filters.track?.trim() || null;
  const recognition = filters.recognition?.trim() || null;
  const sort: ListingSort = filters.sort || "deadline";
  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize || 20));
  const offset = (page - 1) * pageSize;
  const publishedOnly = !includeDrafts;
  const allKinds = includeDrafts && kind === null;
  const coreOnly = !includeDrafts && kind === null;
  const like = q ? `%${q}%` : null;

  const [items, total] = await Promise.all([
    sql<ListingWithEvidence[]>`
      SELECT l.*,
        COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id', e.id, 'listing_id', e.listing_id, 'source_id', e.source_id,
            'code', e.code, 'label', e.label, 'note', e.note, 'source_url', s.url
          ) ORDER BY e.id)
          FROM listing_evidence e LEFT JOIN listing_sources s ON s.id = e.source_id
          WHERE e.listing_id = l.id
        ), '[]'::jsonb) AS evidence,
        (SELECT COUNT(*)::int FROM listing_evidence e WHERE e.listing_id = l.id) AS evidence_count
      FROM listings l
      WHERE (${publishedOnly} = FALSE OR l.published = TRUE)
        AND (${allKinds} = TRUE OR (${coreOnly} = TRUE AND l.kind IN ('competition', 'certification')) OR l.kind = ${kind})
        AND (${status}::text IS NULL OR l.status = ${status})
        AND (${audience}::text IS NULL OR ${audience} = ANY(l.audience))
        AND (${track}::text IS NULL OR ${track} = ANY(l.categories))
        AND (${recognition}::text IS NULL OR EXISTS (
          SELECT 1 FROM listing_evidence re WHERE re.listing_id = l.id AND re.code = ${recognition}
        ))
        AND (
          ${q}::text IS NULL OR l.title ILIKE ${like} OR COALESCE(l.short_title, '') ILIKE ${like}
          OR l.organizer ILIKE ${like} OR l.summary ILIKE ${like} OR l.recognition ILIKE ${like}
        )
      ORDER BY l.featured DESC,
        CASE WHEN ${sort} = 'deadline' THEN l.registration_end END ASC NULLS LAST,
        CASE WHEN ${sort} = 'recently_verified' THEN l.verified_at END DESC NULLS LAST,
        CASE WHEN ${sort} = 'recognition' THEN (SELECT COUNT(*) FROM listing_evidence se WHERE se.listing_id = l.id) END DESC NULLS LAST,
        CASE l.status WHEN 'open' THEN 1 WHEN 'upcoming' THEN 2 WHEN 'year_round' THEN 3 WHEN 'awaiting' THEN 4 ELSE 5 END,
        l.verified_at DESC NULLS LAST, l.title ASC
      LIMIT ${pageSize} OFFSET ${offset}
    `,
    sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count FROM listings l
      WHERE (${publishedOnly} = FALSE OR l.published = TRUE)
        AND (${allKinds} = TRUE OR (${coreOnly} = TRUE AND l.kind IN ('competition', 'certification')) OR l.kind = ${kind})
        AND (${status}::text IS NULL OR l.status = ${status})
        AND (${audience}::text IS NULL OR ${audience} = ANY(l.audience))
        AND (${track}::text IS NULL OR ${track} = ANY(l.categories))
        AND (${recognition}::text IS NULL OR EXISTS (
          SELECT 1 FROM listing_evidence re WHERE re.listing_id = l.id AND re.code = ${recognition}
        ))
        AND (
          ${q}::text IS NULL OR l.title ILIKE ${like} OR COALESCE(l.short_title, '') ILIKE ${like}
          OR l.organizer ILIKE ${like} OR l.summary ILIKE ${like} OR l.recognition ILIKE ${like}
        )
    `
  ]);

  return { items, total: total[0]?.count ?? 0, page, pageSize };
}

export async function getListingBySlug(slug: string, includeDrafts = false): Promise<ListingDetails | null> {
  const sql = db();
  const rows = await sql<ListingWithEvidence[]>`
    SELECT l.*,
      COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id', e.id, 'listing_id', e.listing_id, 'source_id', e.source_id,
          'code', e.code, 'label', e.label, 'note', e.note, 'source_url', s.url
        ) ORDER BY e.id)
        FROM listing_evidence e LEFT JOIN listing_sources s ON s.id = e.source_id
        WHERE e.listing_id = l.id
      ), '[]'::jsonb) AS evidence
    FROM listings l
    WHERE l.slug = ${slug} AND (${includeDrafts} = TRUE OR l.published = TRUE) LIMIT 1
  `;
  const item = rows[0];
  if (!item) return null;

  const [sources, events, related, profiles] = await Promise.all([
    sql<ListingSource[]>`SELECT id, listing_id, role, title, url, monitor_mode, active, last_checked_at, last_success_at, next_check_at, last_error
        FROM listing_sources WHERE listing_id = ${item.id} AND active = TRUE ORDER BY role, id`,
    sql<ListingEvent[]>`SELECT id, listing_id, source_id, cycle_label, event_type, starts_at, ends_at, timezone, confirmed
        FROM listing_events WHERE listing_id = ${item.id} AND confirmed = TRUE
        ORDER BY starts_at ASC NULLS LAST, id`,
    sql<ListingWithEvidence[]>`
      SELECT l.*,
        COALESCE((SELECT jsonb_agg(jsonb_build_object(
          'id', e.id, 'listing_id', e.listing_id, 'source_id', e.source_id,
          'code', e.code, 'label', e.label, 'note', e.note, 'source_url', s.url
        ) ORDER BY e.id) FROM listing_evidence e LEFT JOIN listing_sources s ON s.id = e.source_id
        WHERE e.listing_id = l.id), '[]'::jsonb) AS evidence
      FROM listings l
      WHERE l.published = TRUE AND l.id <> ${item.id} AND l.kind = ${item.kind}
        AND l.categories && ${sql.array(item.categories)}::text[]
      ORDER BY l.featured DESC, l.verified_at DESC NULLS LAST LIMIT 4
    `,
    getListingProfiles(sql, item.id, item.kind)
  ]);

  return { ...item, sources, events, related, ...profiles };
}

export async function getListingById(id: number): Promise<ListingEditorDetails | null> {
  const sql = db();
  const rows = await sql<ListingWithEvidence[]>`
    SELECT l.*,
      COALESCE((SELECT jsonb_agg(jsonb_build_object(
        'id', e.id, 'listing_id', e.listing_id, 'source_id', e.source_id,
        'code', e.code, 'label', e.label, 'note', e.note, 'source_url', s.url
      ) ORDER BY e.id) FROM listing_evidence e LEFT JOIN listing_sources s ON s.id = e.source_id
      WHERE e.listing_id = l.id), '[]'::jsonb) AS evidence
    FROM listings l WHERE l.id = ${id} LIMIT 1
  `;
  const item = rows[0];
  if (!item) return null;
  const profiles = await getListingProfiles(sql, item.id, item.kind);
  return { ...item, ...profiles };
}

async function getListingProfiles(sql: Sql, listingId: number, kind: ListingKind): Promise<ListingProfiles> {
  const profiles: ListingProfiles = {
    competition_profile: null,
    certification_profile: null,
    platform_profile: null
  };
  if (kind === "competition") {
    const rows = await sql<CompetitionProfile[]>`
      SELECT * FROM competition_profiles WHERE listing_id = ${listingId} LIMIT 1
    `;
    profiles.competition_profile = rows[0] ? normalizeProfileNumbers(rows[0]) : null;
  } else if (kind === "certification") {
    const rows = await sql<CertificationProfile[]>`
      SELECT * FROM certification_profiles WHERE listing_id = ${listingId} LIMIT 1
    `;
    profiles.certification_profile = rows[0] ? normalizeProfileNumbers(rows[0]) : null;
  } else {
    const rows = await sql<PlatformProfile[]>`
      SELECT * FROM platform_profiles WHERE listing_id = ${listingId} LIMIT 1
    `;
    profiles.platform_profile = rows[0] ? normalizeProfileNumbers(rows[0]) : null;
  }
  return profiles;
}

const profileNumberFields = new Set([
  "agent_score", "ai_application_score", "algorithm_score", "security_score", "activity_score",
  "direction_match_score", "resume_value", "portfolio_value", "reuse_value", "difficulty",
  "winning_difficulty", "participation_cost", "global_recognition", "china_recognition",
  "technical_depth", "hands_on_score", "ai_agent_score", "learning_value", "ecosystem_value",
  "recruiting_value", "role_match_score", "scarcity_score", "fee_roi_score", "time_roi_score",
  "preparation_cost", "recommendation_score"
]);

function normalizeProfileNumbers<T extends object>(profile: T): T {
  const normalized = { ...profile } as Record<string, unknown>;
  for (const key of profileNumberFields) {
    if (typeof normalized[key] === "string") normalized[key] = Number(normalized[key]);
  }
  return normalized as T;
}

export async function getTaxonomy() {
  const sql = db();
  const [audiences, tracks] = await Promise.all([
    sql<{ value: string }[]>`SELECT DISTINCT UNNEST(audience) AS value FROM listings WHERE published = TRUE AND kind <> 'platform' ORDER BY value`,
    sql<{ value: string }[]>`SELECT DISTINCT UNNEST(categories) AS value FROM listings WHERE published = TRUE AND kind <> 'platform' ORDER BY value`
  ]);
  return { audiences: audiences.map((x) => x.value), tracks: tracks.map((x) => x.value) };
}

export async function getCalendarData() {
  const sql = db();
  return sql<ListingWithEvidence[]>`
    SELECT l.*,
      COALESCE((SELECT jsonb_agg(jsonb_build_object(
        'id', e.id, 'listing_id', e.listing_id, 'source_id', e.source_id,
        'code', e.code, 'label', e.label, 'note', e.note, 'source_url', s.url
      ) ORDER BY e.id) FROM listing_evidence e LEFT JOIN listing_sources s ON s.id = e.source_id
      WHERE e.listing_id = l.id), '[]'::jsonb) AS evidence
    FROM listings l
    WHERE l.published = TRUE AND l.kind = 'competition'
      AND (l.registration_end IS NOT NULL OR l.event_start IS NOT NULL OR l.status = 'year_round')
    ORDER BY COALESCE(l.registration_end, l.event_start) ASC NULLS LAST, l.title ASC
  `;
}

export async function getPlatforms() {
  const sql = db();
  return sql<ListingWithEvidence[]>`
    SELECT l.*,
      COALESCE((SELECT jsonb_agg(jsonb_build_object(
        'id', e.id, 'listing_id', e.listing_id, 'source_id', e.source_id,
        'code', e.code, 'label', e.label, 'note', e.note, 'source_url', s.url
      ) ORDER BY e.id) FROM listing_evidence e LEFT JOIN listing_sources s ON s.id = e.source_id
      WHERE e.listing_id = l.id), '[]'::jsonb) AS evidence
    FROM listings l WHERE l.published = TRUE AND l.kind = 'platform'
    ORDER BY l.title ASC
  `;
}

export async function getReviewItems(status: "pending" | "accepted" | "dismissed" = "pending") {
  const sql = db();
  return sql<ReviewItem[]>`
    SELECT r.*, l.title AS listing_title, s.title AS source_title, s.url AS source_url
    FROM review_items r
    LEFT JOIN listings l ON l.id = r.listing_id
    LEFT JOIN listing_sources s ON s.id = r.source_id
    WHERE r.status = ${status}
    ORDER BY r.detected_at DESC
  `;
}

export async function healthcheck() {
  const sql = db();
  const result = await sql<{ ok: number }[]>`SELECT 1 AS ok`;
  return result[0]?.ok === 1;
}
