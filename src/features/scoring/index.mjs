export const competitionRubric = Object.freeze({
  version: "competition-v1",
  weights: Object.freeze({
    directionMatch: 0.25,
    resumeValue: 0.20,
    portfolioValue: 0.15,
    workingProfessionalFriendly: 0.10,
    individualFriendly: 0.10,
    reuseValue: 0.10,
    winningDifficultyInverse: 0.05,
    participationCostInverse: 0.05
  })
});

export const certificationRubric = Object.freeze({
  version: "certification-v1",
  weights: Object.freeze({
    recruitingValue: 0.25,
    technicalDepth: 0.15,
    handsOnScore: 0.15,
    roleMatch: 0.15,
    ecosystemValue: 0.10,
    scarcity: 0.10,
    feeRoi: 0.05,
    timeRoi: 0.05
  })
});

const flagScores = Object.freeze({ yes: 5, partial: 2.5, no: 0 });

function assertRubric(rubric) {
  const total = Object.values(rubric.weights).reduce((sum, weight) => sum + weight, 0);
  if (Math.abs(total - 1) > Number.EPSILON * 10) {
    throw new Error(`${rubric.version} 权重之和必须为 1，实际为 ${total}`);
  }
}

function isFivePointScore(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 5;
}

function complete(values) {
  return values.every(isFivePointScore);
}

function gradeForScore(score) {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  return "C";
}

function weightedScore(rubric, values) {
  const total = Object.entries(rubric.weights).reduce((sum, [key, weight]) => sum + (values[key] / 5) * weight * 100, 0);
  const score = Math.round(total);
  return { score, grade: gradeForScore(score), rubricVersion: rubric.version };
}

function flagScore(value) {
  return value == null ? null : flagScores[value] ?? null;
}

export function calculateCompetitionScore(input) {
  const values = {
    directionMatch: input.directionMatch,
    resumeValue: input.resumeValue,
    portfolioValue: input.portfolioValue,
    workingProfessionalFriendly: flagScore(input.workingProfessionalFriendly),
    individualFriendly: flagScore(input.individualFriendly),
    reuseValue: input.reuseValue,
    winningDifficultyInverse: isFivePointScore(input.winningDifficulty) ? 5 - input.winningDifficulty : null,
    participationCostInverse: isFivePointScore(input.participationCost) ? 5 - input.participationCost : null
  };
  if (!complete(Object.values(values))) return null;
  return weightedScore(competitionRubric, values);
}

export function calculateCertificationScore(input) {
  const values = {
    recruitingValue: input.recruitingValue,
    technicalDepth: input.technicalDepth,
    handsOnScore: input.handsOnScore,
    roleMatch: input.roleMatch,
    ecosystemValue: input.ecosystemValue,
    scarcity: input.scarcity,
    feeRoi: input.feeRoi,
    timeRoi: input.timeRoi
  };
  if (!complete(Object.values(values))) return null;
  return weightedScore(certificationRubric, values);
}

assertRubric(competitionRubric);
assertRubric(certificationRubric);
