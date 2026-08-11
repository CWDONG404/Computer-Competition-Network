import type {
  CertificationLevel,
  CertificationStatus,
  CertificationType,
  CheckFrequency,
  ChineseFriendly,
  CompetitionType,
  ExperienceLevel,
  Frequency,
  ParticipationFlag,
  RecommendationGrade,
  ScoreStatus,
  VerificationStatus
} from "./types";

export const verificationStatuses: VerificationStatus[] = ["verified", "partial", "unverified"];
export const scoreStatuses: ScoreStatus[] = ["unrated", "draft", "published"];
export const recommendationGrades: RecommendationGrade[] = ["S", "A", "B", "C"];
export const participationFlags: ParticipationFlag[] = ["yes", "partial", "no"];
export const chineseFriendlyLevels: ChineseFriendly[] = ["high", "medium", "low"];
export const competitionTypes: CompetitionType[] = ["build", "benchmark", "hybrid", "ctf", "competitive-programming", "academic"];
export const frequencies: Frequency[] = ["high", "medium", "occasional"];
export const certificationTypes: CertificationType[] = [
  "professional-certification", "hands-on", "micro-credential", "badge", "course-certificate", "training-certificate"
];
export const certificationLevels: CertificationLevel[] = ["entry", "associate", "professional", "expert"];
export const experienceLevels: ExperienceLevel[] = ["beginner", "intermediate", "advanced"];
export const certificationStatuses: CertificationStatus[] = ["active", "retiring", "retired", "unknown"];
export const checkFrequencies: CheckFrequency[] = ["weekly", "biweekly", "monthly"];

export const verificationStatusLabels: Record<VerificationStatus, string> = {
  verified: "官方已核验",
  partial: "部分核验",
  unverified: "尚未核验"
};

export const scoreStatusLabels: Record<ScoreStatus, string> = {
  unrated: "未评分",
  draft: "评分草稿",
  published: "公开评分"
};

export const participationFlagLabels: Record<ParticipationFlag, string> = {
  yes: "是",
  partial: "部分允许",
  no: "否"
};

export const gradeLabels: Record<RecommendationGrade, string> = {
  S: "强烈推荐",
  A: "值得长期关注",
  B: "特定方向值得",
  C: "优先级较低"
};
