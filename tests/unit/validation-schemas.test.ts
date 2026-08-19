import { describe, expect, it } from "vitest";
import {
    projectCreateSchema,
    projectCurateSchema,
    slugSchema,
    idSchema,
    paginationSchema,
    pagePaginationSchema,
    systemLogsQuerySchema,
    campaignCreateSchema,
    notificationPatchSchema,
    onboardingSchema,
    projectsQuerySchema,
    adminUserUpdateSchema,
} from "@/lib/validation/schemas";

describe("projectCreateSchema", () => {
    const valid = {
        title: "  Build an LMS  ",
        description: "A fully open-source LMS for Quran schools, built with a community of volunteers.",
        category: "EDUCATION",
    };

    it("trims whitespace from free-text fields", () => {
        const result = projectCreateSchema.safeParse(valid);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.title).toBe("Build an LMS");
        }
    });

    it("rejects whitespace-only or too-short required fields", () => {
        expect(projectCreateSchema.safeParse({ ...valid, title: "   " }).success).toBe(false);
        expect(projectCreateSchema.safeParse({ ...valid, title: "ab" }).success).toBe(false);
        expect(projectCreateSchema.safeParse({ ...valid, description: "too short" }).success).toBe(false);
    });

    it("rejects invalid categories and unknown keys", () => {
        expect(projectCreateSchema.safeParse({ ...valid, category: "FANTASY" }).success).toBe(false);
        const result = projectCreateSchema.safeParse({ ...valid, unexpected: "value" });
        expect(result.success).toBe(true);
        if (result.success) expect(result.data).not.toHaveProperty("unexpected");
    });

    it("coerces numeric skill ids from strings", () => {
        const result = projectCreateSchema.safeParse({ ...valid, skills: [{ skillId: "4" }] });
        expect(result.success).toBe(true);
        if (result.success) expect(result.data.skills).toEqual([{ skillId: 4, isRequired: undefined }]);
    });
});

describe("slugSchema / idSchema", () => {
    it("accepts lowercase hyphenated slugs", () => {
        expect(slugSchema.safeParse("build-an-lms").success).toBe(true);
        expect(slugSchema.safeParse("ok").success).toBe(true);
    });

    it("rejects uppercase, spaces, and invalid characters", () => {
        expect(slugSchema.safeParse("Build-LMS").success).toBe(false);
        expect(slugSchema.safeParse("bad slug").success).toBe(false);
        expect(slugSchema.safeParse("bad_slug!").success).toBe(false);
        expect(slugSchema.safeParse("").success).toBe(false);
    });

    it("trims and requires a non-empty id", () => {
        expect(idSchema.safeParse("  cm9abc  ").success).toBe(true);
        const result = idSchema.safeParse("  cm9abc  ");
        if (result.success) expect(result.data).toBe("cm9abc");
        expect(idSchema.safeParse("   ").success).toBe(false);
    });
});

describe("pagination schemas", () => {
    it("applies defaults for empty queries", () => {
        const page = pagePaginationSchema.safeParse({});
        expect(page.success).toBe(true);
        if (page.success) expect(page.data).toEqual({ page: 1, limit: 20 });

        const offset = paginationSchema.safeParse({});
        expect(offset.success).toBe(true);
        if (offset.success) expect(offset.data).toEqual({ limit: 20, offset: 0 });
    });

    it("coerces string numbers", () => {
        const parsed = paginationSchema.safeParse({ limit: "5", offset: "2" });
        expect(parsed.success).toBe(true);
        if (parsed.success) expect(parsed.data).toEqual({ limit: 5, offset: 2 });
    });

    it("rejects out-of-range values", () => {
        expect(paginationSchema.safeParse({ limit: 51 }).success).toBe(false);
        expect(paginationSchema.safeParse({ limit: 0 }).success).toBe(false);
        expect(pagePaginationSchema.safeParse({ page: 0 }).success).toBe(false);
    });
});

describe("systemLogsQuerySchema", () => {
    it("coerces an optional numeric status within HTTP range", () => {
        const ok = systemLogsQuerySchema.safeParse({ status: "500" });
        expect(ok.success).toBe(true);
        if (ok.success) expect(ok.data.status).toBe(500);
        expect(systemLogsQuerySchema.safeParse({ status: "99" }).success).toBe(false);
        expect(systemLogsQuerySchema.safeParse({ status: "600" }).success).toBe(false);
    });

    it("accepts an omitted status with pagination defaults", () => {
        const parsed = systemLogsQuerySchema.safeParse({});
        expect(parsed.success).toBe(true);
        if (parsed.success) {
            expect(parsed.data.page).toBe(1);
            expect(parsed.data.status).toBeUndefined();
        }
    });
});

describe("campaignCreateSchema", () => {
    const valid = {
        title: "Build a water well",
        pitch: "A ten-sentence pitch describing this campaign and why it matters.",
        problem: "Many villages lack access to clean drinking water, forcing long daily walks.",
        category: "CHARITY",
    };

    it("accepts valid future dates in order", () => {
        const result = campaignCreateSchema.safeParse({
            ...valid,
            startsAt: "2030-01-01T00:00:00.000Z",
            recruitmentDeadline: "2030-02-01T00:00:00.000Z",
        });
        expect(result.success).toBe(true);
    });

    it("rejects past start dates", () => {
        const result = campaignCreateSchema.safeParse({
            ...valid,
            startsAt: "2020-01-01T00:00:00.000Z",
        });
        expect(result.success).toBe(false);
    });

    it("rejects a deadline before the start date", () => {
        const result = campaignCreateSchema.safeParse({
            ...valid,
            startsAt: "2030-03-01T00:00:00.000Z",
            recruitmentDeadline: "2030-01-01T00:00:00.000Z",
        });
        expect(result.success).toBe(false);
    });
});

describe("notificationPatchSchema", () => {
    it("requires either ids or markAllRead", () => {
        expect(notificationPatchSchema.safeParse({}).success).toBe(false);
        expect(notificationPatchSchema.safeParse({ notificationIds: [] }).success).toBe(false);
        expect(notificationPatchSchema.safeParse({ markAllRead: true }).success).toBe(true);
        expect(notificationPatchSchema.safeParse({ notificationIds: ["cm9abc"] }).success).toBe(true);
    });
});

describe("onboardingSchema", () => {
    it("requires orgName for creators only", () => {
        expect(onboardingSchema.safeParse({ type: "CONTRIBUTOR" }).success).toBe(true);
        expect(onboardingSchema.safeParse({ type: "CREATOR" }).success).toBe(false);
        expect(onboardingSchema.safeParse({ type: "CREATOR", orgName: "Waqf Foundation" }).success).toBe(true);
    });
});

describe("projectsQuerySchema", () => {
    it("normalizes status and parses comma-separated skills", () => {
        const result = projectsQuerySchema.safeParse({ status: " open ", skills: "1,2, 3" });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.status).toBe("OPEN");
            expect(result.data.skills).toEqual([1, 2, 3]);
        }
    });

    it("treats empty skills as absent", () => {
        const result = projectsQuerySchema.safeParse({ skills: "" });
        expect(result.success).toBe(true);
        if (result.success) expect(result.data.skills).toBeUndefined();
    });

    it("rejects an invalid limit", () => {
        expect(projectsQuerySchema.safeParse({ limit: "99" }).success).toBe(false);
    });
});

describe("adminUserUpdateSchema", () => {
    it("requires an explicit role", () => {
        expect(adminUserUpdateSchema.safeParse({}).success).toBe(false);
        expect(adminUserUpdateSchema.safeParse({ role: "ADMIN" }).success).toBe(true);
        expect(adminUserUpdateSchema.safeParse({ role: "SUPERUSER" }).success).toBe(false);
    });
});

describe("projectCurateSchema contact validation", () => {
    const base = {
        title: "External project",
        description: "A sufficiently long description for this externally curated project.",
        category: "EDUCATION",
        externalUrl: "https://example.com/project",
        externalOwnerName: "Waqf Org",
        externalOwnerContact: "volunteer@example.com",
    };

    it("accepts email, URL, and @handle contacts", () => {
        const contact = (externalOwnerContact: string) =>
            projectCurateSchema.safeParse({ ...base, externalOwnerContact }).success;

        expect(contact("volunteer@example.com")).toBe(true);
        expect(contact("https://example.com/profile")).toBe(true);
        expect(contact("@volunteer")).toBe(true);
    });

    it("rejects free-form contact text", () => {
        expect(projectCurateSchema.safeParse({ ...base, externalOwnerContact: "call me on saturday" }).success).toBe(false);
    });
});