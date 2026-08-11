ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('verified', 'partial', 'unverified')),
  ADD COLUMN IF NOT EXISTS topics TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS technologies TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS target_roles TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS special_tags TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS listings_topics_gin_idx ON listings USING GIN(topics);
CREATE INDEX IF NOT EXISTS listings_technologies_gin_idx ON listings USING GIN(technologies);
CREATE INDEX IF NOT EXISTS listings_target_roles_gin_idx ON listings USING GIN(target_roles);
CREATE INDEX IF NOT EXISTS listings_special_tags_gin_idx ON listings USING GIN(special_tags);

CREATE TABLE IF NOT EXISTS competition_profiles (
  listing_id BIGINT PRIMARY KEY REFERENCES listings(id) ON DELETE CASCADE,
  competition_type TEXT CHECK (competition_type IS NULL OR competition_type IN (
    'build', 'benchmark', 'hybrid', 'ctf', 'competitive-programming', 'academic'
  )),
  prize TEXT,
  frequency TEXT CHECK (frequency IS NULL OR frequency IN ('high', 'medium', 'occasional')),
  individual_friendly TEXT CHECK (individual_friendly IS NULL OR individual_friendly IN ('yes', 'partial', 'no')),
  working_professional_allowed TEXT CHECK (working_professional_allowed IS NULL OR working_professional_allowed IN ('yes', 'partial', 'no')),
  student_only TEXT CHECK (student_only IS NULL OR student_only IN ('yes', 'partial', 'no')),
  international_allowed TEXT CHECK (international_allowed IS NULL OR international_allowed IN ('yes', 'partial', 'no')),
  chinese_friendly TEXT CHECK (chinese_friendly IS NULL OR chinese_friendly IN ('high', 'medium', 'low')),
  restrictions TEXT[] NOT NULL DEFAULT '{}',
  examples TEXT[] NOT NULL DEFAULT '{}',
  agent_score NUMERIC(2,1) CHECK (agent_score IS NULL OR agent_score BETWEEN 0 AND 5),
  ai_application_score NUMERIC(2,1) CHECK (ai_application_score IS NULL OR ai_application_score BETWEEN 0 AND 5),
  algorithm_score NUMERIC(2,1) CHECK (algorithm_score IS NULL OR algorithm_score BETWEEN 0 AND 5),
  security_score NUMERIC(2,1) CHECK (security_score IS NULL OR security_score BETWEEN 0 AND 5),
  direction_match_score NUMERIC(2,1) CHECK (direction_match_score IS NULL OR direction_match_score BETWEEN 0 AND 5),
  resume_value NUMERIC(2,1) CHECK (resume_value IS NULL OR resume_value BETWEEN 0 AND 5),
  portfolio_value NUMERIC(2,1) CHECK (portfolio_value IS NULL OR portfolio_value BETWEEN 0 AND 5),
  reuse_value NUMERIC(2,1) CHECK (reuse_value IS NULL OR reuse_value BETWEEN 0 AND 5),
  difficulty NUMERIC(2,1) CHECK (difficulty IS NULL OR difficulty BETWEEN 0 AND 5),
  winning_difficulty NUMERIC(2,1) CHECK (winning_difficulty IS NULL OR winning_difficulty BETWEEN 0 AND 5),
  participation_cost NUMERIC(2,1) CHECK (participation_cost IS NULL OR participation_cost BETWEEN 0 AND 5),
  activity_score NUMERIC(2,1) CHECK (activity_score IS NULL OR activity_score BETWEEN 0 AND 5),
  hidden_gem BOOLEAN NOT NULL DEFAULT FALSE,
  score_status TEXT NOT NULL DEFAULT 'unrated' CHECK (score_status IN ('unrated', 'draft', 'published')),
  score_version TEXT,
  recommendation_score SMALLINT CHECK (recommendation_score IS NULL OR recommendation_score BETWEEN 0 AND 100),
  recommendation_level TEXT CHECK (recommendation_level IS NULL OR recommendation_level IN ('S', 'A', 'B', 'C')),
  scored_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    score_status <> 'published'
    OR (score_version IS NOT NULL AND recommendation_score IS NOT NULL AND recommendation_level IS NOT NULL AND scored_at IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS certification_profiles (
  listing_id BIGINT PRIMARY KEY REFERENCES listings(id) ON DELETE CASCADE,
  category TEXT,
  certification_type TEXT CHECK (certification_type IS NULL OR certification_type IN (
    'professional-certification', 'hands-on', 'micro-credential', 'badge', 'course-certificate', 'training-certificate'
  )),
  certification_level TEXT CHECK (certification_level IS NULL OR certification_level IN ('entry', 'associate', 'professional', 'expert')),
  experience_level TEXT CHECK (experience_level IS NULL OR experience_level IN ('beginner', 'intermediate', 'advanced')),
  exam_format TEXT,
  price TEXT,
  validity TEXT,
  renewal TEXT,
  prerequisites TEXT,
  chinese_exam_available TEXT CHECK (chinese_exam_available IS NULL OR chinese_exam_available IN ('yes', 'partial', 'no')),
  current_status TEXT NOT NULL DEFAULT 'unknown' CHECK (current_status IN ('active', 'retiring', 'retired', 'unknown')),
  notes TEXT[] NOT NULL DEFAULT '{}',
  global_recognition NUMERIC(2,1) CHECK (global_recognition IS NULL OR global_recognition BETWEEN 0 AND 5),
  china_recognition NUMERIC(2,1) CHECK (china_recognition IS NULL OR china_recognition BETWEEN 0 AND 5),
  technical_depth NUMERIC(2,1) CHECK (technical_depth IS NULL OR technical_depth BETWEEN 0 AND 5),
  hands_on_score NUMERIC(2,1) CHECK (hands_on_score IS NULL OR hands_on_score BETWEEN 0 AND 5),
  ai_agent_score NUMERIC(2,1) CHECK (ai_agent_score IS NULL OR ai_agent_score BETWEEN 0 AND 5),
  resume_value NUMERIC(2,1) CHECK (resume_value IS NULL OR resume_value BETWEEN 0 AND 5),
  learning_value NUMERIC(2,1) CHECK (learning_value IS NULL OR learning_value BETWEEN 0 AND 5),
  ecosystem_value NUMERIC(2,1) CHECK (ecosystem_value IS NULL OR ecosystem_value BETWEEN 0 AND 5),
  recruiting_value NUMERIC(2,1) CHECK (recruiting_value IS NULL OR recruiting_value BETWEEN 0 AND 5),
  role_match_score NUMERIC(2,1) CHECK (role_match_score IS NULL OR role_match_score BETWEEN 0 AND 5),
  scarcity_score NUMERIC(2,1) CHECK (scarcity_score IS NULL OR scarcity_score BETWEEN 0 AND 5),
  fee_roi_score NUMERIC(2,1) CHECK (fee_roi_score IS NULL OR fee_roi_score BETWEEN 0 AND 5),
  time_roi_score NUMERIC(2,1) CHECK (time_roi_score IS NULL OR time_roi_score BETWEEN 0 AND 5),
  difficulty NUMERIC(2,1) CHECK (difficulty IS NULL OR difficulty BETWEEN 0 AND 5),
  preparation_cost NUMERIC(2,1) CHECK (preparation_cost IS NULL OR preparation_cost BETWEEN 0 AND 5),
  score_status TEXT NOT NULL DEFAULT 'unrated' CHECK (score_status IN ('unrated', 'draft', 'published')),
  score_version TEXT,
  recommendation_score SMALLINT CHECK (recommendation_score IS NULL OR recommendation_score BETWEEN 0 AND 100),
  recommendation_level TEXT CHECK (recommendation_level IS NULL OR recommendation_level IN ('S', 'A', 'B', 'C')),
  scored_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    score_status <> 'published'
    OR (score_version IS NOT NULL AND recommendation_score IS NOT NULL AND recommendation_level IS NOT NULL AND scored_at IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS platform_profiles (
  listing_id BIGINT PRIMARY KEY REFERENCES listings(id) ON DELETE CASCADE,
  platform_types TEXT[] NOT NULL DEFAULT '{}',
  agent_score NUMERIC(2,1) CHECK (agent_score IS NULL OR agent_score BETWEEN 0 AND 5),
  ai_application_score NUMERIC(2,1) CHECK (ai_application_score IS NULL OR ai_application_score BETWEEN 0 AND 5),
  algorithm_score NUMERIC(2,1) CHECK (algorithm_score IS NULL OR algorithm_score BETWEEN 0 AND 5),
  security_score NUMERIC(2,1) CHECK (security_score IS NULL OR security_score BETWEEN 0 AND 5),
  activity_score NUMERIC(2,1) CHECK (activity_score IS NULL OR activity_score BETWEEN 0 AND 5),
  individual_friendly TEXT CHECK (individual_friendly IS NULL OR individual_friendly IN ('yes', 'partial', 'no')),
  working_professional_friendly TEXT CHECK (working_professional_friendly IS NULL OR working_professional_friendly IN ('yes', 'partial', 'no')),
  check_frequency TEXT NOT NULL DEFAULT 'weekly' CHECK (check_frequency IN ('weekly', 'biweekly', 'monthly')),
  hidden_gem BOOLEAN NOT NULL DEFAULT FALSE,
  recommendation_level TEXT CHECK (recommendation_level IS NULL OR recommendation_level IN ('S', 'A', 'B', 'C')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS competition_profiles_type_idx ON competition_profiles(competition_type);
CREATE INDEX IF NOT EXISTS competition_profiles_grade_idx ON competition_profiles(recommendation_level, recommendation_score DESC);
CREATE INDEX IF NOT EXISTS certification_profiles_type_idx ON certification_profiles(certification_type);
CREATE INDEX IF NOT EXISTS certification_profiles_status_idx ON certification_profiles(current_status);
CREATE INDEX IF NOT EXISTS certification_profiles_grade_idx ON certification_profiles(recommendation_level, recommendation_score DESC);
CREATE INDEX IF NOT EXISTS platform_profiles_types_gin_idx ON platform_profiles USING GIN(platform_types);

UPDATE listings
SET topics = categories
WHERE CARDINALITY(topics) = 0 AND CARDINALITY(categories) > 0;

UPDATE listings l
SET verification_status = 'partial'
WHERE l.verification_status = 'unverified'
  AND l.published = TRUE
  AND l.verified_at IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM listing_sources s
    WHERE s.listing_id = l.id AND s.role = 'official' AND s.active = TRUE
  )
  AND EXISTS (SELECT 1 FROM listing_evidence e WHERE e.listing_id = l.id);

INSERT INTO competition_profiles (listing_id)
SELECT id FROM listings WHERE kind = 'competition'
ON CONFLICT (listing_id) DO NOTHING;

INSERT INTO certification_profiles (listing_id, category, exam_format, price, validity)
SELECT id, categories[1], format, fee, validity_period
FROM listings WHERE kind = 'certification'
ON CONFLICT (listing_id) DO NOTHING;

INSERT INTO platform_profiles (listing_id, platform_types)
SELECT id, categories FROM listings WHERE kind = 'platform'
ON CONFLICT (listing_id) DO NOTHING;

DROP TRIGGER IF EXISTS competition_profiles_set_updated_at ON competition_profiles;
CREATE TRIGGER competition_profiles_set_updated_at
BEFORE UPDATE ON competition_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS certification_profiles_set_updated_at ON certification_profiles;
CREATE TRIGGER certification_profiles_set_updated_at
BEFORE UPDATE ON certification_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS platform_profiles_set_updated_at ON platform_profiles;
CREATE TRIGGER platform_profiles_set_updated_at
BEFORE UPDATE ON platform_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
