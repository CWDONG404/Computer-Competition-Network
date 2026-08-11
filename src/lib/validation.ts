import { z } from "zod";

const emptyToNull = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") return null;
  return value;
};

const commaList = z.string().transform((value) => value.split(/[，,]/).map((item) => item.trim()).filter(Boolean));
const optionalText = (max: number) => z.preprocess(emptyToNull, z.string().trim().max(max).nullable());
const optionalScore = z.preprocess(
  emptyToNull,
  z.coerce.number().min(0).max(5).refine((value) => Number.isInteger(value * 10), "评分最多保留一位小数").nullable()
);

export const listingSchema = z.object({
  kind: z.enum(["competition", "certification", "platform"]),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug 只能包含小写字母、数字和连字符"),
  title: z.string().trim().min(2).max(160),
  short_title: optionalText(60),
  summary: z.string().trim().min(10).max(500),
  organizer: z.string().trim().min(2).max(160),
  official_url: z.url(),
  source_url: z.url(),
  audience: commaList,
  categories: commaList,
  topics: commaList,
  technologies: commaList,
  target_roles: commaList,
  special_tags: commaList,
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
  fee: optionalText(100),
  team_size: optionalText(100),
  status: z.enum(["open", "upcoming", "year_round", "awaiting", "closed"]),
  cycle_type: z.enum(["fixed", "annual", "rolling", "on_demand"]),
  eligibility: z.string().trim().min(2).max(500),
  language: z.string().trim().min(1).max(100),
  validity_period: optionalText(160),
  next_review_at: z.preprocess(emptyToNull, z.iso.date().nullable()),
  verification_status: z.enum(["verified", "partial", "unverified"]),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  verified_at: z.preprocess(emptyToNull, z.iso.date().nullable())
});

export const competitionProfileSchema = z.object({
  competition_type: z.preprocess(emptyToNull, z.enum(["build", "benchmark", "hybrid", "ctf", "competitive-programming", "academic"]).nullable()),
  prize: optionalText(160),
  frequency: z.preprocess(emptyToNull, z.enum(["high", "medium", "occasional"]).nullable()),
  individual_friendly: z.preprocess(emptyToNull, z.enum(["yes", "partial", "no"]).nullable()),
  working_professional_allowed: z.preprocess(emptyToNull, z.enum(["yes", "partial", "no"]).nullable()),
  student_only: z.preprocess(emptyToNull, z.enum(["yes", "partial", "no"]).nullable()),
  international_allowed: z.preprocess(emptyToNull, z.enum(["yes", "partial", "no"]).nullable()),
  chinese_friendly: z.preprocess(emptyToNull, z.enum(["high", "medium", "low"]).nullable()),
  restrictions: commaList,
  examples: commaList,
  agent_score: optionalScore,
  ai_application_score: optionalScore,
  algorithm_score: optionalScore,
  security_score: optionalScore,
  direction_match_score: optionalScore,
  resume_value: optionalScore,
  portfolio_value: optionalScore,
  reuse_value: optionalScore,
  difficulty: optionalScore,
  winning_difficulty: optionalScore,
  participation_cost: optionalScore,
  activity_score: optionalScore,
  hidden_gem: z.boolean().default(false),
  score_status: z.enum(["unrated", "draft", "published"])
});

export const certificationProfileSchema = z.object({
  category: optionalText(80),
  certification_type: z.preprocess(emptyToNull, z.enum([
    "professional-certification", "hands-on", "micro-credential", "badge", "course-certificate", "training-certificate"
  ]).nullable()),
  certification_level: z.preprocess(emptyToNull, z.enum(["entry", "associate", "professional", "expert"]).nullable()),
  experience_level: z.preprocess(emptyToNull, z.enum(["beginner", "intermediate", "advanced"]).nullable()),
  exam_format: optionalText(500),
  price: optionalText(160),
  validity: optionalText(160),
  renewal: optionalText(500),
  prerequisites: optionalText(500),
  chinese_exam_available: z.preprocess(emptyToNull, z.enum(["yes", "partial", "no"]).nullable()),
  current_status: z.enum(["active", "retiring", "retired", "unknown"]),
  notes: commaList,
  global_recognition: optionalScore,
  china_recognition: optionalScore,
  technical_depth: optionalScore,
  hands_on_score: optionalScore,
  ai_agent_score: optionalScore,
  resume_value: optionalScore,
  learning_value: optionalScore,
  ecosystem_value: optionalScore,
  recruiting_value: optionalScore,
  role_match_score: optionalScore,
  scarcity_score: optionalScore,
  fee_roi_score: optionalScore,
  time_roi_score: optionalScore,
  difficulty: optionalScore,
  preparation_cost: optionalScore,
  score_status: z.enum(["unrated", "draft", "published"])
});

export const platformProfileSchema = z.object({
  platform_types: commaList,
  agent_score: optionalScore,
  ai_application_score: optionalScore,
  algorithm_score: optionalScore,
  security_score: optionalScore,
  activity_score: optionalScore,
  individual_friendly: z.preprocess(emptyToNull, z.enum(["yes", "partial", "no"]).nullable()),
  working_professional_friendly: z.preprocess(emptyToNull, z.enum(["yes", "partial", "no"]).nullable()),
  check_frequency: z.enum(["weekly", "biweekly", "monthly"]),
  hidden_gem: z.boolean().default(false),
  recommendation_level: z.preprocess(emptyToNull, z.enum(["S", "A", "B", "C"]).nullable())
});

export type ListingInput = z.infer<typeof listingSchema>;
export type CompetitionProfileInput = z.infer<typeof competitionProfileSchema>;
export type CertificationProfileInput = z.infer<typeof certificationProfileSchema>;
export type PlatformProfileInput = z.infer<typeof platformProfileSchema>;

const text = (formData: FormData, name: string) => String(formData.get(name) || "");
const scoreStatus = (formData: FormData) => text(formData, "profile_score_status") || "unrated";

function commonProfilePayload(formData: FormData) {
  return {
    agent_score: text(formData, "profile_agent_score"),
    ai_application_score: text(formData, "profile_ai_application_score"),
    algorithm_score: text(formData, "profile_algorithm_score"),
    security_score: text(formData, "profile_security_score")
  };
}

export function formDataToListing(formData: FormData) {
  const listing = listingSchema.parse({
    ...Object.fromEntries(formData.entries()),
    topics: text(formData, "topics"),
    technologies: text(formData, "technologies"),
    target_roles: text(formData, "target_roles"),
    special_tags: text(formData, "special_tags"),
    verification_status: text(formData, "verification_status") || "unverified",
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on"
  });

  if (listing.kind === "competition") {
    return {
      listing,
      profile: competitionProfileSchema.parse({
        competition_type: text(formData, "competition_type"),
        prize: text(formData, "competition_prize"),
        frequency: text(formData, "competition_frequency"),
        individual_friendly: text(formData, "competition_individual_friendly"),
        working_professional_allowed: text(formData, "competition_working_professional_allowed"),
        student_only: text(formData, "competition_student_only"),
        international_allowed: text(formData, "competition_international_allowed"),
        chinese_friendly: text(formData, "competition_chinese_friendly"),
        restrictions: text(formData, "competition_restrictions"),
        examples: text(formData, "competition_examples"),
        ...commonProfilePayload(formData),
        direction_match_score: text(formData, "competition_direction_match_score"),
        resume_value: text(formData, "competition_resume_value"),
        portfolio_value: text(formData, "competition_portfolio_value"),
        reuse_value: text(formData, "competition_reuse_value"),
        difficulty: text(formData, "competition_difficulty"),
        winning_difficulty: text(formData, "competition_winning_difficulty"),
        participation_cost: text(formData, "competition_participation_cost"),
        activity_score: text(formData, "competition_activity_score"),
        hidden_gem: formData.get("profile_hidden_gem") === "on",
        score_status: scoreStatus(formData)
      })
    };
  }

  if (listing.kind === "certification") {
    return {
      listing,
      profile: certificationProfileSchema.parse({
        category: text(formData, "certification_category"),
        certification_type: text(formData, "certification_type"),
        certification_level: text(formData, "certification_level"),
        experience_level: text(formData, "certification_experience_level"),
        exam_format: text(formData, "certification_exam_format"),
        price: text(formData, "certification_price"),
        validity: text(formData, "certification_validity"),
        renewal: text(formData, "certification_renewal"),
        prerequisites: text(formData, "certification_prerequisites"),
        chinese_exam_available: text(formData, "certification_chinese_exam_available"),
        current_status: text(formData, "certification_current_status") || "unknown",
        notes: text(formData, "certification_notes"),
        global_recognition: text(formData, "certification_global_recognition"),
        china_recognition: text(formData, "certification_china_recognition"),
        technical_depth: text(formData, "certification_technical_depth"),
        hands_on_score: text(formData, "certification_hands_on_score"),
        ai_agent_score: text(formData, "certification_ai_agent_score"),
        resume_value: text(formData, "certification_resume_value"),
        learning_value: text(formData, "certification_learning_value"),
        ecosystem_value: text(formData, "certification_ecosystem_value"),
        recruiting_value: text(formData, "certification_recruiting_value"),
        role_match_score: text(formData, "certification_role_match_score"),
        scarcity_score: text(formData, "certification_scarcity_score"),
        fee_roi_score: text(formData, "certification_fee_roi_score"),
        time_roi_score: text(formData, "certification_time_roi_score"),
        difficulty: text(formData, "certification_difficulty"),
        preparation_cost: text(formData, "certification_preparation_cost"),
        score_status: scoreStatus(formData)
      })
    };
  }

  return {
    listing,
    profile: platformProfileSchema.parse({
      platform_types: text(formData, "platform_types"),
      ...commonProfilePayload(formData),
      activity_score: text(formData, "platform_activity_score"),
      individual_friendly: text(formData, "platform_individual_friendly"),
      working_professional_friendly: text(formData, "platform_working_professional_friendly"),
      check_frequency: text(formData, "platform_check_frequency") || "weekly",
      hidden_gem: formData.get("profile_hidden_gem") === "on",
      recommendation_level: text(formData, "platform_recommendation_level")
    })
  };
}
