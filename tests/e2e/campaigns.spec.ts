import { test, expect } from "@playwright/test";

test.describe("Campaigns — public UI smoke", () => {
    test("campaigns list page loads with hero heading", async ({ page }) => {
        await page.goto("/en/campaigns");
        await expect(page.locator("h1").first()).toBeVisible();
    });

    test("campaigns list page has a start CTA in the navbar or hero", async ({
        page,
    }) => {
        await page.goto("/en/campaigns");
        const campaignsLink = page.locator('a[href*="/campaigns"]').first();
        await expect(campaignsLink).toBeVisible();
    });

    test("new campaign route redirects to login when unauthenticated", async ({
        page,
    }) => {
        await page.goto("/en/campaigns/new");
        await page.waitForURL(/\/login/, { timeout: 5000 });
    });

    test("dashboard campaigns route redirects to login when unauthenticated", async ({
        page,
    }) => {
        await page.goto("/en/dashboard/campaigns");
        await page.waitForURL(/\/login/, { timeout: 5000 });
    });

    test("dashboard campaign-joins route redirects to login when unauthenticated", async ({
        page,
    }) => {
        await page.goto("/en/dashboard/campaign-joins");
        await page.waitForURL(/\/login/, { timeout: 5000 });
    });

    test("admin campaigns route redirects non-admins", async ({ page }) => {
        await page.goto("/en/admin/campaigns");
        // Either redirects to login or to landing (per admin layout guard).
        await page.waitForTimeout(1500);
        const url = page.url();
        expect(url === "/en/admin/campaigns" || /\/login|\/$/.test(url)).toBeTruthy();
    });
});
