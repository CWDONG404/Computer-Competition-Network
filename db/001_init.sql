CREATE TABLE IF NOT EXISTS listings (
  id BIGSERIAL PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('competition', 'certification')),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  short_title TEXT,
  summary TEXT NOT NULL,
  organizer TEXT NOT NULL,
  official_url TEXT NOT NULL,
  source_url TEXT NOT NULL,
  audience TEXT[] NOT NULL DEFAULT '{}',
  categories TEXT[] NOT NULL DEFAULT '{}',
  level TEXT NOT NULL DEFAULT '行业认可',
  format TEXT NOT NULL DEFAULT '以官网为准',
  region TEXT NOT NULL DEFAULT '不限',
  registration_start DATE,
  registration_end DATE,
  event_start DATE,
  event_end DATE,
  schedule_note TEXT NOT NULL DEFAULT '具体时间以官网最新公告为准',
  recognition TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  fee TEXT,
  team_size TEXT,
  status TEXT NOT NULL DEFAULT 'awaiting' CHECK (status IN ('open', 'upcoming', 'year_round', 'awaiting', 'closed')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS listings_kind_idx ON listings(kind);
CREATE INDEX IF NOT EXISTS listings_status_idx ON listings(status);
CREATE INDEX IF NOT EXISTS listings_published_idx ON listings(published);
CREATE INDEX IF NOT EXISTS listings_registration_end_idx ON listings(registration_end);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS listings_set_updated_at ON listings;
CREATE TRIGGER listings_set_updated_at
BEFORE UPDATE ON listings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
