import { describe, expect, it } from "vitest";
import type { PlatformStats } from "@/lib/stats";
import { buildWeeklyReportHtml, buildWeeklyReportSubject, buildWeeklyReportText } from "@/lib/weekly-report";

function sampleStats(): PlatformStats {
    return {
        overview: {
            totalUsers: 123,
            totalProjects: 45,
            totalApplications: 67,
            pendingProjects: 3,
            activeProjects: 12,
        },
        growth: {
            newUsersThisMonth: 10,
            newProjectsThisMonth: 5,
            newApplicationsThisWeek: 8,
        },
        rates: {
            acceptanceRate: 42,
        },
        breakdown: {
            projectsByStatus: {
                DRAFT: 1,
                PENDING: 3,
                OPEN: 12,
                IN_PROGRESS: 4,
                COMPLETED: 20,
                CANCELLED: 5,
            },
            applicationsByStatus: {
                PENDING: 2,
                ACCEPTED: 3,
                REJECTED: 4,
                WITHDRAWN: 5,
            },
        },
        recent: {
            projects: [],
            topContributors: [],
        },
    };
}

describe("buildWeeklyReportSubject", () => {
    it("formats the trailing 7-day range from the asOf date", () => {
        const asOf = new Date("2026-08-19T10:00:00.000Z");
        expect(buildWeeklyReportSubject(asOf)).toBe("Waqf weekly report — 2026-08-12 to 2026-08-19");
    });
});

describe("buildWeeklyReportText", () => {
    it("includes all overview, growth, and rate figures", () => {
        const text = buildWeeklyReportText(sampleStats());
        expect(text).toMatch(/Total users\s+123/);
        expect(text).toMatch(/Total projects\s+45/);
        expect(text).toMatch(/New applications \(this week\)\s+8/);
        expect(text).toMatch(/Application acceptance\s+42%/);
    });

    it("renders every status bucket for projects and applications", () => {
        const text = buildWeeklyReportText(sampleStats());
        expect(text).toContain("PENDING: 3 · OPEN: 12");
        expect(text).toContain("ACCEPTED: 3 · REJECTED: 4");
    });

    it("does not emit a percentage sign on a missing acceptance count", () => {
        const stats = sampleStats();
        stats.rates.acceptanceRate = 0;
        expect(buildWeeklyReportText(stats)).toMatch(/Application acceptance\s+0%/);
    });
});

describe("buildWeeklyReportHtml", () => {
    it("escapes nothing and formats a table with the same figures", () => {
        const html = buildWeeklyReportHtml(sampleStats());
        expect(html).toContain("<table");
        expect(html).toContain("Total users</td><td style=\"padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:right\">123</td>");
        expect(html).toContain("42%");
    });

    it("includes status breakdown lines", () => {
        const html = buildWeeklyReportHtml(sampleStats());
        expect(html).toContain("Projects: DRAFT 1 · PENDING 3 · OPEN 12");
        expect(html).toContain("Applications: PENDING 2 · ACCEPTED 3");
    });
});