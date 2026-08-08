import { SkillLevel, ProjectCategory, ProjectLanguage } from "@prisma/client";

// ============================================
// SCORING TYPES
// ============================================

/** Individual score breakdown for transparency */
export interface ScoreBreakdown {
  skillScore: number; // 0-70 points
  categoryScore: number; // 0-15 points
  languageScore: number; // 0-10 points
  recencyScore: number; // 0-5 points
}

/** Result of matching a contributor to a project */
export interface MatchResult {
  projectId: string;
  totalScore: number; // 0-100 (sum of all scores)
  breakdown: ScoreBreakdown;
  matchedSkills: MatchedSkill[];
  isAvailable: boolean; // Project status === OPEN
}

/** Skill match detail */
export interface MatchedSkill {
  skillId: number;
  skillName: string;
  contributorLevel: SkillLevel;
  isRequired: boolean;
}

/** Weights for each scoring component */
export interface ScoringWeights {
  skills: number; // 70
  category: number; // 15
  language: number; // 10
  recency: number; // 5
}

// ============================================
// INPUT DATA TYPES
// ============================================

/** Contributor data needed for matching */
export interface ContributorMatchData {
  id: string;
  skills: Array<{
    skillId: number;
    skillName: string;
    level: SkillLevel;
  }>;
  preferredCategories: ProjectCategory[];
  spokenLanguages: string[]; // ["ar", "en"]
}

/** Project data needed for matching */
export interface ProjectMatchData {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: ProjectCategory;
  language: ProjectLanguage;
  createdAt: Date;
  skills: Array<{
    skillId: number;
    skillName: string;
    isRequired: boolean;
  }>;
  owner: {
    id: string;
    name: string;
    image: string | null;
  } | null;
}

// ============================================
// API RESPONSE TYPES
// ============================================

/** Single recommended project in API response */
export interface RecommendedProject extends ProjectMatchData {
  matchScore: number;
  scoreBreakdown: ScoreBreakdown;
  matchedSkills: MatchedSkill[];
}

/** Full API response for recommended projects */
export interface RecommendedProjectsResponse {
  projects: RecommendedProject[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// ============================================
// CONSTANTS
// ============================================

export const DEFAULT_WEIGHTS: ScoringWeights = {
  skills: 70,
  category: 15,
  language: 10,
  recency: 5,
};

export const SKILL_LEVEL_MULTIPLIERS: Record<SkillLevel, number> = {
  BEGINNER: 0.5,
  INTERMEDIATE: 0.75,
  ADVANCED: 0.9,
  EXPERT: 1.0,
};
