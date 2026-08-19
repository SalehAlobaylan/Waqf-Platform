import { describe, expect, it } from "vitest";
import {
    calculateMatchScore,
    scoreProjects,
    getRecommendedProjects,
    getLevelMultiplier,
} from "@/lib/matching/engine";
import {
    ContributorMatchData,
    ProjectMatchData,
    DEFAULT_WEIGHTS,
    SKILL_LEVEL_MULTIPLIERS,
} from "@/lib/matching/types";

const DAY = 24 * 60 * 60 * 1000;

function makeContributor(overrides: Partial<ContributorMatchData> = {}): ContributorMatchData {
    return {
        id: "contributor-1",
        skills: [],
        preferredCategories: ["EDUCATION"],
        spokenLanguages: ["en"],
        ...overrides,
    };
}

function makeProject(overrides: Partial<ProjectMatchData> = {}): ProjectMatchData {
    return {
        id: "project-1",
        title: "Build an LMS",
        slug: "build-an-lms",
        description: "Open-source LMS for Quran schools",
        category: "EDUCATION",
        language: "ENGLISH",
        createdAt: new Date(Date.now() - 2 * DAY),
        skills: [],
        owner: null,
        ...overrides,
    };
}

const skill = (skillId: number, skillName: string, isRequired = false) => ({
    skillId,
    skillName,
    isRequired,
});

const contributorSkill = (
    skillId: number,
    skillName: string,
    level: keyof typeof SKILL_LEVEL_MULTIPLIERS
) => ({
    skillId,
    skillName,
    level,
});

describe("calculateMatchScore", () => {
    it("returns a perfect 100 when every component is a full match", () => {
        const contributor = makeContributor({
            skills: [contributorSkill(1, "JavaScript", "EXPERT"), contributorSkill(2, "TypeScript", "EXPERT")],
            preferredCategories: ["EDUCATION"],
            spokenLanguages: ["en"],
        });
        const project = makeProject({
            category: "EDUCATION",
            language: "ENGLISH",
            skills: [skill(1, "JavaScript", true), skill(2, "TypeScript", false)],
        });

        const result = calculateMatchScore(contributor, project);

        expect(result.totalScore).toBe(100);
        expect(result.breakdown).toEqual({
            skillScore: 70,
            categoryScore: 15,
            languageScore: 10,
            recencyScore: 5,
        });
    });

    it("returns 0 when there are no overlaps and the project is stale", () => {
        const contributor = makeContributor({
            skills: [contributorSkill(9, "Design", "ADVANCED")],
            preferredCategories: ["CHARITY"],
            spokenLanguages: ["ar"],
        });
        const project = makeProject({
            category: "EDUCATION",
            language: "ENGLISH",
            createdAt: new Date(Date.now() - 40 * DAY),
            skills: [skill(1, "JavaScript", true)],
        });

        const result = calculateMatchScore(contributor, project);

        expect(result.totalScore).toBe(0);
        expect(result.matchedSkills).toEqual([]);
    });

    it("weights skill level: EXPERT beats BEGINNER on the same required skill", () => {
        const project = makeProject({ skills: [skill(1, "JavaScript", true)] });

        const expert = calculateMatchScore(
            makeContributor({ skills: [contributorSkill(1, "JavaScript", "EXPERT")] }),
            project
        );
        const beginner = calculateMatchScore(
            makeContributor({ skills: [contributorSkill(1, "JavaScript", "BEGINNER")] }),
            project
        );

        expect(expert.breakdown.skillScore).toBe(70);
        expect(beginner.breakdown.skillScore).toBe(35);
        expect(expert.totalScore).toBeGreaterThan(beginner.totalScore);
    });

    it("prorates when only some required skills are matched", () => {
        const project = makeProject({
            skills: [skill(1, "JavaScript", true), skill(2, "TypeScript", true)],
            category: "EDUCATION",
            language: "ENGLISH",
        });
        const contributor = makeContributor({
            skills: [contributorSkill(1, "JavaScript", "BEGINNER")],
            preferredCategories: ["EDUCATION"],
            spokenLanguages: ["en"],
        });

        const result = calculateMatchScore(contributor, project);

        // 1 of 2 required skills at BEGINNER (0.5) -> (0.5 / 2.0) * 70 = 17.5
        expect(result.breakdown.skillScore).toBe(17.5);
        expect(result.totalScore).toBe(17.5 + 15 + 10 + 5);
    });

    it("reports matched skill details with the correct required flag", () => {
        const project = makeProject({
            skills: [skill(1, "JavaScript", true), skill(2, "Python", false)],
        });
        const contributor = makeContributor({
            skills: [contributorSkill(1, "JavaScript", "ADVANCED")],
        });

        const result = calculateMatchScore(contributor, project);

        expect(result.matchedSkills).toEqual([
            { skillId: 1, skillName: "JavaScript", contributorLevel: "ADVANCED", isRequired: true },
        ]);
    });

    it("returns zero skill score when the project lists no skills", () => {
        const result = calculateMatchScore(
            makeContributor({ skills: [contributorSkill(1, "JavaScript", "EXPERT")] }),
            makeProject({ skills: [] })
        );

        expect(result.breakdown.skillScore).toBe(0);
        expect(result.matchedSkills).toEqual([]);
    });

    it("awards full language points when the contributor speaks any project language", () => {
        const both = calculateMatchScore(
            makeContributor({ spokenLanguages: ["ar"] }),
            makeProject({ language: "BOTH" })
        );
        const englishOnly = calculateMatchScore(
            makeContributor({ spokenLanguages: ["ar"] }),
            makeProject({ language: "ENGLISH" })
        );

        expect(both.breakdown.languageScore).toBe(10);
        expect(englishOnly.breakdown.languageScore).toBe(0);
    });

    it("awards category points only when the category is preferred", () => {
        const inPref = calculateMatchScore(
            makeContributor({ preferredCategories: ["EDUCATION"] }),
            makeProject({ category: "EDUCATION" })
        );
        const notPref = calculateMatchScore(
            makeContributor({ preferredCategories: ["CHARITY"] }),
            makeProject({ category: "EDUCATION" })
        );

        expect(inPref.breakdown.categoryScore).toBe(15);
        expect(notPref.breakdown.categoryScore).toBe(0);
    });

    it("decays recency linearly between day 7 and day 30", () => {
        const recent = calculateMatchScore(
            makeContributor(),
            makeProject({ createdAt: new Date(Date.now() - 6 * DAY) })
        );
        const stale = calculateMatchScore(
            makeContributor(),
            makeProject({ createdAt: new Date(Date.now() - 30 * DAY) })
        );
        const decayed = calculateMatchScore(
            makeContributor(),
            makeProject({ createdAt: new Date(Date.now() - 20 * DAY) })
        );

        expect(recent.breakdown.recencyScore).toBe(5);
        expect(stale.breakdown.recencyScore).toBe(0);
        // 5 * (1 - 13/23) rounded to two decimals
        expect(decayed.breakdown.recencyScore).toBe(2.17);
    });
});

describe("getLevelMultiplier", () => {
    it("matches the SKILL_LEVEL_MULTIPLIERS table for every level", () => {
        for (const [level, multiplier] of Object.entries(SKILL_LEVEL_MULTIPLIERS)) {
            expect(getLevelMultiplier(level as keyof typeof SKILL_LEVEL_MULTIPLIERS)).toBe(multiplier);
        }
    });
});

describe("scoreProjects / getRecommendedProjects", () => {
    it("sorts projects by score descending", () => {
        const contributor = makeContributor({
            skills: [contributorSkill(1, "JavaScript", "EXPERT")],
            preferredCategories: ["EDUCATION"],
        });
        const best = makeProject({
            id: "best",
            category: "EDUCATION",
            language: "ENGLISH",
            skills: [skill(1, "JavaScript", true)],
        });
        const worst = makeProject({
            id: "worst",
            category: "CHARITY",
            language: "ARABIC",
            skills: [skill(7, "Campaigning", true)],
        });

        const results = scoreProjects(contributor, [worst, best]);

        expect(results.map((r) => r.projectId)).toEqual(["best", "worst"]);
        expect(results[0].totalScore).toBeGreaterThan(results[1].totalScore);
    });

    it("applies pagination and merges match data into the recommended payload", () => {
        const contributor = makeContributor();
        const projects = [makeProject({ id: "p1" }), makeProject({ id: "p2" }), makeProject({ id: "p3" })];

        const { projects: recommended, total } = getRecommendedProjects(contributor, projects, {
            limit: 2,
            offset: 1,
        });

        expect(total).toBe(3);
        expect(recommended).toHaveLength(2);
        expect(recommended[0].matchScore).toBeGreaterThanOrEqual(0);
        expect(recommended[0].scoreBreakdown).toBeDefined();
        expect(recommended[0].matchedSkills).toEqual([]);
    });

    it("respects DEFAULT_WEIGHTS used by the API by default", () => {
        expect(DEFAULT_WEIGHTS).toEqual({ skills: 70, category: 15, language: 10, recency: 5 });
    });
});