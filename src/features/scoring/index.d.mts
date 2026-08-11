import type { ParticipationFlag, RecommendationGrade } from "../catalog/types";

export interface ScoreResult {
  score: number;
  grade: RecommendationGrade;
  rubricVersion: string;
}

export interface CompetitionScoreInput {
  directionMatch?: number | null;
  resumeValue?: number | null;
  portfolioValue?: number | null;
  workingProfessionalFriendly?: ParticipationFlag | null;
  individualFriendly?: ParticipationFlag | null;
  reuseValue?: number | null;
  winningDifficulty?: number | null;
  participationCost?: number | null;
}

export interface CertificationScoreInput {
  recruitingValue?: number | null;
  technicalDepth?: number | null;
  handsOnScore?: number | null;
  roleMatch?: number | null;
  ecosystemValue?: number | null;
  scarcity?: number | null;
  feeRoi?: number | null;
  timeRoi?: number | null;
}

export const competitionRubric: Readonly<{ version: "competition-v1"; weights: Readonly<Record<string, number>> }>;
export const certificationRubric: Readonly<{ version: "certification-v1"; weights: Readonly<Record<string, number>> }>;
export function calculateCompetitionScore(input: CompetitionScoreInput): ScoreResult | null;
export function calculateCertificationScore(input: CertificationScoreInput): ScoreResult | null;
