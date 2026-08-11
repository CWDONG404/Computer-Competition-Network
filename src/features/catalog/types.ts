export type VerificationStatus = "verified" | "partial" | "unverified";
export type RecommendationGrade = "S" | "A" | "B" | "C";
export type ScoreStatus = "unrated" | "draft" | "published";
export type ParticipationFlag = "yes" | "partial" | "no";
export type ChineseFriendly = "high" | "medium" | "low";
export type CompetitionType =
  | "build"
  | "benchmark"
  | "hybrid"
  | "ctf"
  | "competitive-programming"
  | "academic";
export type Frequency = "high" | "medium" | "occasional";
export type CertificationType =
  | "professional-certification"
  | "hands-on"
  | "micro-credential"
  | "badge"
  | "course-certificate"
  | "training-certificate";
export type CertificationLevel = "entry" | "associate" | "professional" | "expert";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type CertificationStatus = "active" | "retiring" | "retired" | "unknown";
export type CheckFrequency = "weekly" | "biweekly" | "monthly";

export interface ScoreSnapshot {
  score_status: ScoreStatus;
  score_version: string | null;
  recommendation_score: number | null;
  recommendation_level: RecommendationGrade | null;
  scored_at: string | null;
}

export interface CompetitionProfile extends ScoreSnapshot {
  listing_id: number;
  competition_type: CompetitionType | null;
  prize: string | null;
  frequency: Frequency | null;
  individual_friendly: ParticipationFlag | null;
  working_professional_allowed: ParticipationFlag | null;
  student_only: ParticipationFlag | null;
  international_allowed: ParticipationFlag | null;
  chinese_friendly: ChineseFriendly | null;
  restrictions: string[];
  examples: string[];
  agent_score: number | null;
  ai_application_score: number | null;
  algorithm_score: number | null;
  security_score: number | null;
  direction_match_score: number | null;
  resume_value: number | null;
  portfolio_value: number | null;
  reuse_value: number | null;
  difficulty: number | null;
  winning_difficulty: number | null;
  participation_cost: number | null;
  activity_score: number | null;
  hidden_gem: boolean;
}

export interface CertificationProfile extends ScoreSnapshot {
  listing_id: number;
  category: string | null;
  certification_type: CertificationType | null;
  certification_level: CertificationLevel | null;
  experience_level: ExperienceLevel | null;
  exam_format: string | null;
  price: string | null;
  validity: string | null;
  renewal: string | null;
  prerequisites: string | null;
  chinese_exam_available: ParticipationFlag | null;
  current_status: CertificationStatus;
  notes: string[];
  global_recognition: number | null;
  china_recognition: number | null;
  technical_depth: number | null;
  hands_on_score: number | null;
  ai_agent_score: number | null;
  resume_value: number | null;
  learning_value: number | null;
  ecosystem_value: number | null;
  recruiting_value: number | null;
  role_match_score: number | null;
  scarcity_score: number | null;
  fee_roi_score: number | null;
  time_roi_score: number | null;
  difficulty: number | null;
  preparation_cost: number | null;
}

export interface PlatformProfile {
  listing_id: number;
  platform_types: string[];
  agent_score: number | null;
  ai_application_score: number | null;
  algorithm_score: number | null;
  security_score: number | null;
  activity_score: number | null;
  individual_friendly: ParticipationFlag | null;
  working_professional_friendly: ParticipationFlag | null;
  check_frequency: CheckFrequency;
  hidden_gem: boolean;
  recommendation_level: RecommendationGrade | null;
}

export interface ListingProfiles {
  competition_profile: CompetitionProfile | null;
  certification_profile: CertificationProfile | null;
  platform_profile: PlatformProfile | null;
}
