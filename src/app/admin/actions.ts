"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  formDataToListing,
  type CertificationProfileInput,
  type CompetitionProfileInput,
  type PlatformProfileInput
} from "@/lib/validation";
import {
  calculateCertificationScore,
  calculateCompetitionScore,
  type ScoreResult
} from "@/features/scoring/index.mjs";
import { evidenceLabels, type EvidenceCode } from "@/types/listing";

export interface FormState { error?: string; fieldErrors?: Record<string, string[]> }

export async function saveListingAction(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsedId = Number(formData.get("id") || 0);
  let parsed;
  try {
    parsed = formDataToListing(formData);
  } catch (error) {
    const flattened = (error as { flatten?: () => { fieldErrors: Record<string, string[]> } }).flatten?.();
    return { error: "请检查表单中的必填项和格式。", fieldErrors: flattened?.fieldErrors };
  }
  const { listing: item, profile } = parsed;

  const allowedEvidenceCodes = new Set(Object.keys(evidenceLabels) as EvidenceCode[]);
  const evidenceCodes = [...new Set(
    formData.getAll("evidence_codes").filter((value): value is EvidenceCode =>
      typeof value === "string" && allowedEvidenceCodes.has(value as EvidenceCode)
    )
  )];
  if (item.published && (!item.verified_at || evidenceCodes.length === 0 || item.verification_status === "unverified")) {
    return { error: "发布前必须填写核验日期、选择认可证据，并将核验状态设为部分核验或官方已核验。" };
  }

  let scoreResult: ScoreResult | null = null;
  if (item.kind === "competition") {
    const competition = profile as CompetitionProfileInput;
    scoreResult = calculateCompetitionScore({
      directionMatch: competition.direction_match_score,
      resumeValue: competition.resume_value,
      portfolioValue: competition.portfolio_value,
      workingProfessionalFriendly: competition.working_professional_allowed,
      individualFriendly: competition.individual_friendly,
      reuseValue: competition.reuse_value,
      winningDifficulty: competition.winning_difficulty,
      participationCost: competition.participation_cost
    });
    if (competition.score_status === "published" && !scoreResult) {
      return { error: "公开竞赛评分前，必须完整填写评分 Rubric 的全部必需维度。" };
    }
  } else if (item.kind === "certification") {
    const certification = profile as CertificationProfileInput;
    scoreResult = calculateCertificationScore({
      recruitingValue: certification.recruiting_value,
      technicalDepth: certification.technical_depth,
      handsOnScore: certification.hands_on_score,
      roleMatch: certification.role_match_score,
      ecosystemValue: certification.ecosystem_value,
      scarcity: certification.scarcity_score,
      feeRoi: certification.fee_roi_score,
      timeRoi: certification.time_roi_score
    });
    if (certification.score_status === "published" && !scoreResult) {
      return { error: "公开认证评分前，必须完整填写评分 Rubric 的全部必需维度。" };
    }
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
            published=${item.published}, verified_at=${item.verified_at}, verification_status=${item.verification_status},
            topics=ARRAY(SELECT jsonb_array_elements_text(${tx.json(item.topics)}::jsonb)),
            technologies=ARRAY(SELECT jsonb_array_elements_text(${tx.json(item.technologies)}::jsonb)),
            target_roles=ARRAY(SELECT jsonb_array_elements_text(${tx.json(item.target_roles)}::jsonb)),
            special_tags=ARRAY(SELECT jsonb_array_elements_text(${tx.json(item.special_tags)}::jsonb)),
            catalog_managed=FALSE
          WHERE id=${parsedId}
        `;
      } else {
        const inserted = await tx<{ id: number }[]>`
          INSERT INTO listings (
            kind, slug, title, short_title, summary, organizer, official_url, source_url, audience, categories,
            level, format, region, registration_start, registration_end, event_start, event_end, schedule_note,
            recognition, recommendation, fee, team_size, status, cycle_type, eligibility, language, validity_period,
            next_review_at, featured, published, verified_at, verification_status,
            topics, technologies, target_roles, special_tags, catalog_managed
          ) VALUES (
            ${item.kind}, ${item.slug}, ${item.title}, ${item.short_title}, ${item.summary}, ${item.organizer},
            ${item.official_url}, ${item.source_url}, ${tx.array(item.audience)}, ${tx.array(item.categories)},
            ${item.level}, ${item.format}, ${item.region}, ${item.registration_start}, ${item.registration_end},
            ${item.event_start}, ${item.event_end}, ${item.schedule_note}, ${item.recognition}, ${item.recommendation},
            ${item.fee}, ${item.team_size}, ${item.status}, ${item.cycle_type}, ${item.eligibility}, ${item.language},
            ${item.validity_period}, ${item.next_review_at}, ${item.featured}, ${item.published}, ${item.verified_at},
            ${item.verification_status},
            ARRAY(SELECT jsonb_array_elements_text(${tx.json(item.topics)}::jsonb)),
            ARRAY(SELECT jsonb_array_elements_text(${tx.json(item.technologies)}::jsonb)),
            ARRAY(SELECT jsonb_array_elements_text(${tx.json(item.target_roles)}::jsonb)),
            ARRAY(SELECT jsonb_array_elements_text(${tx.json(item.special_tags)}::jsonb)), FALSE
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

      if (item.kind === "competition") {
        const competition = profile as CompetitionProfileInput;
        const persistedScore = competition.score_status === "unrated" ? null : scoreResult;
        await tx`DELETE FROM certification_profiles WHERE listing_id=${listingId}`;
        await tx`DELETE FROM platform_profiles WHERE listing_id=${listingId}`;
        await tx`
          INSERT INTO competition_profiles (
            listing_id, competition_type, prize, frequency, individual_friendly, working_professional_allowed,
            student_only, international_allowed, chinese_friendly, restrictions, examples,
            agent_score, ai_application_score, algorithm_score, security_score, direction_match_score,
            resume_value, portfolio_value, reuse_value, difficulty, winning_difficulty, participation_cost,
            activity_score, hidden_gem, score_status, score_version, recommendation_score,
            recommendation_level, scored_at
          ) VALUES (
            ${listingId}, ${competition.competition_type}, ${competition.prize}, ${competition.frequency},
            ${competition.individual_friendly}, ${competition.working_professional_allowed}, ${competition.student_only},
            ${competition.international_allowed}, ${competition.chinese_friendly},
            ARRAY(SELECT jsonb_array_elements_text(${tx.json(competition.restrictions)}::jsonb)),
            ARRAY(SELECT jsonb_array_elements_text(${tx.json(competition.examples)}::jsonb)),
            ${competition.agent_score}, ${competition.ai_application_score}, ${competition.algorithm_score},
            ${competition.security_score}, ${competition.direction_match_score}, ${competition.resume_value},
            ${competition.portfolio_value}, ${competition.reuse_value}, ${competition.difficulty},
            ${competition.winning_difficulty}, ${competition.participation_cost}, ${competition.activity_score},
            ${competition.hidden_gem}, ${competition.score_status}, ${persistedScore?.rubricVersion ?? null},
            ${persistedScore?.score ?? null}, ${persistedScore?.grade ?? null},
            ${persistedScore ? new Date() : null}
          )
          ON CONFLICT (listing_id) DO UPDATE SET
            competition_type=EXCLUDED.competition_type, prize=EXCLUDED.prize, frequency=EXCLUDED.frequency,
            individual_friendly=EXCLUDED.individual_friendly,
            working_professional_allowed=EXCLUDED.working_professional_allowed, student_only=EXCLUDED.student_only,
            international_allowed=EXCLUDED.international_allowed, chinese_friendly=EXCLUDED.chinese_friendly,
            restrictions=EXCLUDED.restrictions, examples=EXCLUDED.examples, agent_score=EXCLUDED.agent_score,
            ai_application_score=EXCLUDED.ai_application_score, algorithm_score=EXCLUDED.algorithm_score,
            security_score=EXCLUDED.security_score, direction_match_score=EXCLUDED.direction_match_score,
            resume_value=EXCLUDED.resume_value, portfolio_value=EXCLUDED.portfolio_value,
            reuse_value=EXCLUDED.reuse_value, difficulty=EXCLUDED.difficulty,
            winning_difficulty=EXCLUDED.winning_difficulty, participation_cost=EXCLUDED.participation_cost,
            activity_score=EXCLUDED.activity_score, hidden_gem=EXCLUDED.hidden_gem,
            score_status=EXCLUDED.score_status, score_version=EXCLUDED.score_version,
            recommendation_score=EXCLUDED.recommendation_score,
            recommendation_level=EXCLUDED.recommendation_level, scored_at=EXCLUDED.scored_at
        `;
      } else if (item.kind === "certification") {
        const certification = profile as CertificationProfileInput;
        const persistedScore = certification.score_status === "unrated" ? null : scoreResult;
        await tx`DELETE FROM competition_profiles WHERE listing_id=${listingId}`;
        await tx`DELETE FROM platform_profiles WHERE listing_id=${listingId}`;
        await tx`
          INSERT INTO certification_profiles (
            listing_id, category, certification_type, certification_level, experience_level, exam_format,
            price, validity, renewal, prerequisites, chinese_exam_available, current_status, notes,
            global_recognition, china_recognition, technical_depth, hands_on_score, ai_agent_score,
            resume_value, learning_value, ecosystem_value, recruiting_value, role_match_score,
            scarcity_score, fee_roi_score, time_roi_score, difficulty, preparation_cost,
            score_status, score_version, recommendation_score, recommendation_level, scored_at
          ) VALUES (
            ${listingId}, ${certification.category}, ${certification.certification_type},
            ${certification.certification_level}, ${certification.experience_level}, ${certification.exam_format},
            ${certification.price}, ${certification.validity}, ${certification.renewal},
            ${certification.prerequisites}, ${certification.chinese_exam_available}, ${certification.current_status},
            ARRAY(SELECT jsonb_array_elements_text(${tx.json(certification.notes)}::jsonb)),
            ${certification.global_recognition}, ${certification.china_recognition},
            ${certification.technical_depth}, ${certification.hands_on_score}, ${certification.ai_agent_score},
            ${certification.resume_value}, ${certification.learning_value}, ${certification.ecosystem_value},
            ${certification.recruiting_value}, ${certification.role_match_score}, ${certification.scarcity_score},
            ${certification.fee_roi_score}, ${certification.time_roi_score}, ${certification.difficulty},
            ${certification.preparation_cost}, ${certification.score_status},
            ${persistedScore?.rubricVersion ?? null}, ${persistedScore?.score ?? null},
            ${persistedScore?.grade ?? null}, ${persistedScore ? new Date() : null}
          )
          ON CONFLICT (listing_id) DO UPDATE SET
            category=EXCLUDED.category, certification_type=EXCLUDED.certification_type,
            certification_level=EXCLUDED.certification_level, experience_level=EXCLUDED.experience_level,
            exam_format=EXCLUDED.exam_format, price=EXCLUDED.price, validity=EXCLUDED.validity,
            renewal=EXCLUDED.renewal, prerequisites=EXCLUDED.prerequisites,
            chinese_exam_available=EXCLUDED.chinese_exam_available, current_status=EXCLUDED.current_status,
            notes=EXCLUDED.notes, global_recognition=EXCLUDED.global_recognition,
            china_recognition=EXCLUDED.china_recognition, technical_depth=EXCLUDED.technical_depth,
            hands_on_score=EXCLUDED.hands_on_score, ai_agent_score=EXCLUDED.ai_agent_score,
            resume_value=EXCLUDED.resume_value, learning_value=EXCLUDED.learning_value,
            ecosystem_value=EXCLUDED.ecosystem_value, recruiting_value=EXCLUDED.recruiting_value,
            role_match_score=EXCLUDED.role_match_score, scarcity_score=EXCLUDED.scarcity_score,
            fee_roi_score=EXCLUDED.fee_roi_score, time_roi_score=EXCLUDED.time_roi_score,
            difficulty=EXCLUDED.difficulty, preparation_cost=EXCLUDED.preparation_cost,
            score_status=EXCLUDED.score_status, score_version=EXCLUDED.score_version,
            recommendation_score=EXCLUDED.recommendation_score,
            recommendation_level=EXCLUDED.recommendation_level, scored_at=EXCLUDED.scored_at
        `;
      } else {
        const platform = profile as PlatformProfileInput;
        await tx`DELETE FROM competition_profiles WHERE listing_id=${listingId}`;
        await tx`DELETE FROM certification_profiles WHERE listing_id=${listingId}`;
        await tx`
          INSERT INTO platform_profiles (
            listing_id, platform_types, agent_score, ai_application_score, algorithm_score, security_score,
            activity_score, individual_friendly, working_professional_friendly, check_frequency,
            hidden_gem, recommendation_level
          ) VALUES (
            ${listingId}, ARRAY(SELECT jsonb_array_elements_text(${tx.json(platform.platform_types)}::jsonb)),
            ${platform.agent_score}, ${platform.ai_application_score}, ${platform.algorithm_score},
            ${platform.security_score}, ${platform.activity_score}, ${platform.individual_friendly},
            ${platform.working_professional_friendly}, ${platform.check_frequency}, ${platform.hidden_gem},
            ${platform.recommendation_level}
          )
          ON CONFLICT (listing_id) DO UPDATE SET
            platform_types=EXCLUDED.platform_types, agent_score=EXCLUDED.agent_score,
            ai_application_score=EXCLUDED.ai_application_score, algorithm_score=EXCLUDED.algorithm_score,
            security_score=EXCLUDED.security_score, activity_score=EXCLUDED.activity_score,
            individual_friendly=EXCLUDED.individual_friendly,
            working_professional_friendly=EXCLUDED.working_professional_friendly,
            check_frequency=EXCLUDED.check_frequency, hidden_gem=EXCLUDED.hidden_gem,
            recommendation_level=EXCLUDED.recommendation_level
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
    verification_status: "verified" | "partial" | "unverified";
    has_official_source: boolean;
    has_evidence: boolean;
  }[]>`
    SELECT l.published, l.verified_at, l.verification_status,
      EXISTS (SELECT 1 FROM listing_sources s WHERE s.listing_id=l.id AND s.role='official' AND s.active=TRUE) AS has_official_source,
      EXISTS (SELECT 1 FROM listing_evidence e WHERE e.listing_id=l.id) AS has_evidence
    FROM listings l WHERE l.id=${id} LIMIT 1
  `;
  const listing = rows[0];
  if (!listing) return;
  if (!listing.published && (
    !listing.verified_at || listing.verification_status === "unverified"
    || !listing.has_official_source || !listing.has_evidence
  )) {
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
