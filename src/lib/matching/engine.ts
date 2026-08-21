import { ProjectLanguage, SkillLevel } from "@prisma/client";
import {
  ContributorMatchData,
  ProjectMatchData,
  MatchResult,
  MatchedSkill,
  ScoringWeights,
  DEFAULT_WEIGHTS,
  SKILL_LEVEL_MULTIPLIERS,
  RecommendedProject,
} from "./types";

// ============================================
// CORE SCORING ALGORITHM
// ============================================

/**
 * Calculate the "Waqf Score" for a contributor-project pair.
 * Based on PRD §3.5 with enhanced skill-level weighting.
 */
export function calculateMatchScore(
  contributor: ContributorMatchData,
  project: ProjectMatchData,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): MatchResult {
  // 1. SKILL MATCH (70% weight)
  const { skillScore, matchedSkills } = calculateSkillScore(
    contributor,
    project,
    weights.skills
  );

  // 2. CATEGORY MATCH (15% weight)
  const categoryScore = calculateCategoryScore(
    contributor,
    project,
    weights.category
  );

  // 3. LANGUAGE MATCH (10% weight)
  const languageScore = calculateLanguageScore(
    contributor,
    project,
    weights.language
  );

  // 4. RECENCY SCORE (5% weight)
  const recencyScore = calculateRecencyScore(project, weights.recency);

  // TOTAL
  const totalScore = skillScore + categoryScore + languageScore + recencyScore;

  return {
    projectId: project.id,
    totalScore: roundToTwoDecimals(totalScore),
    breakdown: {
      skillScore: roundToTwoDecimals(skillScore),
      categoryScore,
      languageScore,
      recencyScore: roundToTwoDecimals(recencyScore),
    },
    matchedSkills,
    isAvailable: true, // Caller should set based on project status
  };
}

// ============================================
// INDIVIDUAL SCORE CALCULATIONS
// ============================================

/**
 * Calculate skill match score.
 * Enhanced: Weighted by contributor's skill level.
 * Required skills worth more than optional.
 */
function calculateSkillScore(
  contributor: ContributorMatchData,
  project: ProjectMatchData,
  maxPoints: number
): { skillScore: number; matchedSkills: MatchedSkill[] } {
  if (project.skills.length === 0) {
    return { skillScore: 0, matchedSkills: [] };
  }

  const projectSkillIds = new Set(project.skills.map((s) => s.skillId));
  const requiredSkillIds = new Set(
    project.skills.filter((s) => s.isRequired).map((s) => s.skillId)
  );

  let earnedPoints = 0;
  const matchedSkills: MatchedSkill[] = [];

  // Calculate max possible points
  const requiredCount = requiredSkillIds.size;
  const optionalCount = projectSkillIds.size - requiredCount;
  const maxPossiblePoints = requiredCount * 1.0 + optionalCount * 0.5;

  for (const contributorSkill of contributor.skills) {
    if (projectSkillIds.has(contributorSkill.skillId)) {
      const levelMultiplier =
        SKILL_LEVEL_MULTIPLIERS[contributorSkill.level] || 0.5;
      const isRequired = requiredSkillIds.has(contributorSkill.skillId);

      // Required skills worth full point, optional worth half
      const baseValue = isRequired ? 1.0 : 0.5;
      earnedPoints += baseValue * levelMultiplier;

      // Find skill name from project skills
      const projectSkill = project.skills.find(
        (s) => s.skillId === contributorSkill.skillId
      );

      matchedSkills.push({
        skillId: contributorSkill.skillId,
        skillName: projectSkill?.skillName || contributorSkill.skillName,
        contributorLevel: contributorSkill.level,
        isRequired,
      });
    }
  }

  // Normalize to weight
  const skillScore =
    maxPossiblePoints > 0 ? (earnedPoints / maxPossiblePoints) * maxPoints : 0;

  return { skillScore, matchedSkills };
}

/**
 * Calculate category preference match.
 * Full points if project category matches contributor's preferred categories.
 */
function calculateCategoryScore(
  contributor: ContributorMatchData,
  project: ProjectMatchData,
  maxPoints: number
): number {
  return contributor.preferredCategories.includes(project.category)
    ? maxPoints
    : 0;
}

/**
 * Calculate language compatibility score.
 * Full points if contributor speaks at least one of the project's languages.
 */
function calculateLanguageScore(
  contributor: ContributorMatchData,
  project: ProjectMatchData,
  maxPoints: number
): number {
  const projectLanguages = getLanguagesFromEnum(project.language);
  const hasOverlap = contributor.spokenLanguages.some((lang) =>
    projectLanguages.includes(lang)
  );
  return hasOverlap ? maxPoints : 0;
}

/**
 * Calculate recency score.
 * Full points for projects < 7 days old.
 * Linear decay to 0 at 30 days.
 */
function calculateRecencyScore(
  project: ProjectMatchData,
  maxPoints: number
): number {
  const daysSincePosted = getDaysSince(project.createdAt);

  if (daysSincePosted <= 7) {
    return maxPoints;
  }

  if (daysSincePosted >= 30) {
    return 0;
  }

  // Linear decay between day 7 and day 30
  const decayFactor = 1 - (daysSincePosted - 7) / 23;
  return maxPoints * decayFactor;
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Score multiple projects for a contributor.
 * Returns projects sorted by score descending.
 */
export function scoreProjects(
  contributor: ContributorMatchData,
  projects: ProjectMatchData[],
  weights: ScoringWeights = DEFAULT_WEIGHTS
): MatchResult[] {
  const results = projects.map((project) =>
    calculateMatchScore(contributor, project, weights)
  );

  // Sort by total score descending
  return results.sort((a, b) => b.totalScore - a.totalScore);
}

/**
 * Upper bound on how many candidate projects are scored per request.
 * Recency decays to zero at 30 days, so older projects contribute nothing
 * meaningful to ranking; capping keeps scoring O(candidates) instead of
 * O(all open projects).
 */
export const MAX_RECOMMENDED_CANDIDATES = 200;

/**
 * Get recommended projects with full project data.
 * Merges match results with project data for API response.
 */
export function getRecommendedProjects(
  contributor: ContributorMatchData,
  projects: ProjectMatchData[],
  options: { limit?: number; offset?: number } = {}
): { projects: RecommendedProject[]; total: number } {
  const { limit = 10, offset = 0 } = options;

  // Score all projects
  const matchResults = scoreProjects(contributor, projects);

  // Get total before pagination
  const total = matchResults.length;

  // Apply pagination
  const paginatedResults = matchResults.slice(offset, offset + limit);

  // Merge with project data (Map lookup instead of O(n²) find)
  const byId = new Map(projects.map((p) => [p.id, p]));
  const recommendedProjects: RecommendedProject[] = paginatedResults.map(
    (result) => {
      const project = byId.get(result.projectId)!;
      return {
        ...project,
        matchScore: result.totalScore,
        scoreBreakdown: result.breakdown,
        matchedSkills: result.matchedSkills,
      };
    }
  );

  return { projects: recommendedProjects, total };
}

// ============================================
// HELPERS
// ============================================

/**
 * Convert ProjectLanguage enum to language codes.
 */
function getLanguagesFromEnum(lang: ProjectLanguage): string[] {
  switch (lang) {
    case "ARABIC":
      return ["ar"];
    case "ENGLISH":
      return ["en"];
    case "BOTH":
      return ["ar", "en"];
    default:
      return [];
  }
}

/**
 * Calculate days since a date.
 */
function getDaysSince(date: Date): number {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Round to two decimal places.
 */
function roundToTwoDecimals(num: number): number {
  return Math.round(num * 100) / 100;
}

/**
 * Get skill level multiplier.
 */
export function getLevelMultiplier(level: SkillLevel): number {
  return SKILL_LEVEL_MULTIPLIERS[level] || 0.5;
}
