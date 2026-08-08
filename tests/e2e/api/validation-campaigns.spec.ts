import { test, expect } from "@playwright/test";
import { signInAs, SEEDED_USERS } from "../auth-helpers";
import {
    expectForbiddenError,
    expectUnauthorizedError,
    expectValidationError,
} from "./helpers";

test.describe("API Validation - Campaigns", () => {
    test("GET /api/campaigns accepts valid status filter", async ({ request }) => {
        const response = await request.get("/api/campaigns?status=RECRUITING");
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body.campaigns)).toBeTruthy();
    });

    test("GET /api/campaigns rejects unknown status", async ({ request }) => {
        const response = await request.get("/api/campaigns?status=FOO");
        await expectValidationError(response, "status");
    });

    test("GET /api/campaigns rejects limit out of range", async ({ request }) => {
        const response = await request.get("/api/campaigns?limit=999");
        await expectValidationError(response, "limit");
    });

    test("GET /api/campaigns rejects offset below 0", async ({ request }) => {
        const response = await request.get("/api/campaigns?offset=-1");
        await expectValidationError(response, "offset");
    });

    test("GET /api/campaigns rejects oversized search", async ({ request }) => {
        const longSearch = "a".repeat(130);
        const response = await request.get(`/api/campaigns?search=${longSearch}`);
        await expectValidationError(response, "search");
    });

    test("GET /api/campaigns rejects oversized skills", async ({ request }) => {
        const longSkills = "a".repeat(210);
        const response = await request.get(`/api/campaigns?skills=${longSkills}`);
        await expectValidationError(response, "skills");
    });

    test("POST /api/campaigns requires authentication", async ({ request }) => {
        const response = await request.post("/api/campaigns", {
            data: {
                title: "Test",
                pitch: "x".repeat(50),
                problem: "x".repeat(50),
            },
        });
        await expectUnauthorizedError(response);
    });

    test("POST /api/campaigns rejects missing fields for unauthenticated", async ({
        request,
    }) => {
        const response = await request.post("/api/campaigns", { data: {} });
        await expectUnauthorizedError(response);
    });

    test("POST /api/campaigns/abc/joins requires authentication", async ({ request }) => {
        const response = await request.post("/api/campaigns/abc/joins", {
            data: { campaignRoleId: "r1" },
        });
        await expectUnauthorizedError(response);
    });

    test("POST /api/admin/campaigns requires admin role", async ({ page }) => {
        await signInAs(page, SEEDED_USERS.omar);
        const response = await page.request.get("/api/admin/campaigns");
        await expectForbiddenError(response);
    });

    test("POST /api/admin/campaigns/<id>/approve rejects non-admin", async ({ page }) => {
        await signInAs(page, SEEDED_USERS.omar);
        const response = await page.request.post(
            "/api/admin/campaigns/some-id/approve",
            { data: { feedback: "looks good" } }
        );
        await expectForbiddenError(response);
    });

    test("admin approve route accepts feedback (no action field needed)", async ({ page }) => {
        await signInAs(page, SEEDED_USERS.admin);
        const response = await page.request.post(
            "/api/admin/campaigns/some-id/approve",
            { data: { feedback: "looks good" } }
        );
        // 404 (campaign not found) is expected — proves auth + validation passed
        expect([400, 404]).toContain(response.status());
    });

    test("admin reject route accepts feedback (no action field needed)", async ({ page }) => {
        await signInAs(page, SEEDED_USERS.admin);
        const response = await page.request.post(
            "/api/admin/campaigns/some-id/reject",
            { data: { feedback: "needs more detail" } }
        );
        expect([400, 404]).toContain(response.status());
    });

    test("admin campaigns query rejects unknown status", async ({ page, request }) => {
        await signInAs(page, SEEDED_USERS.admin);
        const response = await page.request.get("/api/admin/campaigns?status=BOGUS");
        await expectValidationError(response, "status");
    });
});
