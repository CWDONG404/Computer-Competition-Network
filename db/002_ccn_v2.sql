ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_kind_check;
ALTER TABLE listings ADD CONSTRAINT listings_kind_check CHECK (kind IN ('competition', 'certification', 'platform'));

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS cycle_type TEXT NOT NULL DEFAULT 'annual'
    CHECK (cycle_type IN ('fixed', 'annual', 'rolling', 'on_demand')),
  ADD COLUMN IF NOT EXISTS eligibility TEXT NOT NULL DEFAULT '以官方规则为准',
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT '中文或英文',
  ADD COLUMN IF NOT EXISTS validity_period TEXT,
  ADD COLUMN IF NOT EXISTS next_review_at DATE,
  ADD COLUMN IF NOT EXISTS catalog_managed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS catalog_version INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS listing_sources (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('official', 'rules', 'schedule', 'recognition', 'renewal')),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  monitor_mode TEXT NOT NULL DEFAULT 'http' CHECK (monitor_mode IN ('http', 'manual')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  etag TEXT,
  last_modified TEXT,
  content_hash TEXT,
  last_checked_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  next_check_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (listing_id, role, url)
);

CREATE TABLE IF NOT EXISTS listing_events (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  source_id BIGINT REFERENCES listing_sources(id) ON DELETE SET NULL,
  cycle_label TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('registration_open', 'registration_close', 'preliminary', 'final', 'exam_window', 'result')),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  timezone TEXT NOT NULL DEFAULT 'Asia/Shanghai',
  confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (listing_id, cycle_label, event_type, starts_at)
);

CREATE TABLE IF NOT EXISTS listing_evidence (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  source_id BIGINT REFERENCES listing_sources(id) ON DELETE SET NULL,
  code TEXT NOT NULL CHECK (code IN (
    'government', 'cahe_catalog', 'international_org', 'national_qualification',
    'official_vendor', 'hands_on_exam', 'experience_required', 'public_output', 'renewal_required'
  )),
  label TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (listing_id, code)
);

CREATE TABLE IF NOT EXISTS review_items (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT REFERENCES listings(id) ON DELETE CASCADE,
  source_id BIGINT REFERENCES listing_sources(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('content_changed', 'check_failed', 'stale')),
  summary TEXT NOT NULL,
  previous_hash TEXT,
  current_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dismissed')),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  review_note TEXT,
  UNIQUE NULLS NOT DISTINCT (source_id, type, status)
);

CREATE INDEX IF NOT EXISTS listing_sources_next_check_idx ON listing_sources(active, next_check_at);
CREATE INDEX IF NOT EXISTS listing_events_starts_at_idx ON listing_events(starts_at);
CREATE INDEX IF NOT EXISTS listing_evidence_listing_idx ON listing_evidence(listing_id);
CREATE INDEX IF NOT EXISTS review_items_status_idx ON review_items(status, detected_at DESC);

DROP TRIGGER IF EXISTS listing_sources_set_updated_at ON listing_sources;
CREATE TRIGGER listing_sources_set_updated_at
BEFORE UPDATE ON listing_sources
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
