import assert from "node:assert/strict";
import {
  calculateCertificationScore,
  calculateCompetitionScore,
  certificationRubric,
  competitionRubric
} from "../src/features/scoring/index.mjs";

const weightSum = (rubric) => Object.values(rubric.weights).reduce((sum, value) => sum + value, 0);
assert.equal(weightSum(competitionRubric), 1, "竞赛评分权重之和必须为 1");
assert.equal(weightSum(certificationRubric), 1, "认证评分权重之和必须为 1");

assert.deepEqual(calculateCompetitionScore({
  directionMatch: 5,
  resumeValue: 5,
  portfolioValue: 5,
  workingProfessionalFriendly: "yes",
  individualFriendly: "yes",
  reuseValue: 5,
  winningDifficulty: 0,
  participationCost: 0
}), { score: 100, grade: "S", rubricVersion: "competition-v1" });

assert.deepEqual(calculateCompetitionScore({
  directionMatch: 4,
  resumeValue: 4,
  portfolioValue: 4,
  workingProfessionalFriendly: "partial",
  individualFriendly: "partial",
  reuseValue: 4,
  winningDifficulty: 1,
  participationCost: 1
}), { score: 74, grade: "B", rubricVersion: "competition-v1" });

assert.equal(calculateCompetitionScore({
  directionMatch: 5,
  resumeValue: null,
  portfolioValue: 5,
  workingProfessionalFriendly: "yes",
  individualFriendly: "yes",
  reuseValue: 5,
  winningDifficulty: 2,
  participationCost: 2
}), null, "缺少必需维度时必须保持未评分");

assert.deepEqual(calculateCertificationScore({
  recruitingValue: 4,
  technicalDepth: 4,
  handsOnScore: 4,
  roleMatch: 4,
  ecosystemValue: 4,
  scarcity: 4,
  feeRoi: 4,
  timeRoi: 4
}), { score: 80, grade: "A", rubricVersion: "certification-v1" });

assert.equal(calculateCertificationScore({
  recruitingValue: 6,
  technicalDepth: 5,
  handsOnScore: 5,
  roleMatch: 5,
  ecosystemValue: 5,
  scarcity: 5,
  feeRoi: 5,
  timeRoi: 5
}), null, "超出 0–5 范围的评分必须拒绝");

console.log("CCN Score 验收通过：权重、反向维度、缺失值和等级映射符合 v1 Rubric。");
