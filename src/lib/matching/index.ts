// Matching Engine - Public API
export {
  calculateMatchScore,
  scoreProjects,
  getRecommendedProjects,
  getLevelMultiplier,
} from "./engine";

export {
  type ScoreBreakdown,
  type MatchResult,
  type MatchedSkill,
  type ScoringWeights,
  type ContributorMatchData,
  type ProjectMatchData,
  type RecommendedProject,
  type RecommendedProjectsResponse,
  DEFAULT_WEIGHTS,
  SKILL_LEVEL_MULTIPLIERS,
} from "./types";
