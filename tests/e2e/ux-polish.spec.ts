import { test, expect } from "@playwright/test";
import { signInAs, SEEDED_USERS } from "./auth-helpers";

const ADMIN_USERNAME = "mdyr-alnzam";
const OMAR_USERNAME = "amr-alfarsy";

test.describe("Phase 2 UX Polish: Back Buttons", () => {
    test.describe("Project Edit Page", () => {
        test("shows a back link to the project detail page", async ({ page }) => {
            await signInAs(page, SEEDED_USERS.admin);

            await page.goto("/en/projects/halal-food-scanner/edit");
            await page.waitForLoadState("networkidle");

            const backLink = page.locator('a:has-text("Back")').first();
            await expect(backLink).toBeVisible();
            await expect(backLink).toHaveAttribute("href", /\/en\/projects\/halal-food-scanner$/);
        });

        test("back link is rotated for RTL on the Arabic edit page", async ({ page }) => {
            await signInAs(page, SEEDED_USERS.admin);

            await page.goto("/ar/projects/halal-food-scanner/edit");
            await page.waitForLoadState("networkidle");

            const backLink = page.locator('a:has-text("رجوع")').first();
            await expect(backLink).toBeVisible();
            await expect(backLink).toHaveAttribute("href", /\/ar\/projects\/halal-food-scanner$/);
        });
    });

    test.describe("Project Edit Not-Found", () => {
        test("returns 404 with the translated not-found page in English", async ({ page }) => {
            await signInAs(page, SEEDED_USERS.admin);

            const response = await page.goto("/en/projects/this-project-does-not-exist-xyz/edit");
            expect(response?.status()).toBe(404);

            await expect(page.locator("h1", { hasText: "Project Not Found" })).toBeVisible();
            await expect(page.locator("a", { hasText: "Back to Explore" })).toBeVisible();
        });

        test("returns 404 with the translated not-found page in Arabic", async ({ page }) => {
            await signInAs(page, SEEDED_USERS.admin);

            const response = await page.goto("/ar/projects/this-project-does-not-exist-xyz/edit");
            expect(response?.status()).toBe(404);

            await expect(page.locator("h1", { hasText: "المشروع غير موجود" })).toBeVisible();
            await expect(page.locator("a", { hasText: "العودة إلى الاستكشاف" })).toBeVisible();
        });
    });
});

test.describe("Profile URL Migration", () => {
    test("profile page is accessible by username slug", async ({ page }) => {
        await page.goto(`/en/profile/${OMAR_USERNAME}`);
        await page.waitForLoadState("networkidle");

        await expect(page.locator("h1")).toBeVisible();
        const content = await page.content();
        expect(content.toLowerCase()).toContain("omar");
    });

    test("profile page also resolves the admin's username", async ({ page }) => {
        await page.goto(`/en/profile/${ADMIN_USERNAME}`);
        await page.waitForLoadState("networkidle");

        await expect(page.locator("h1")).toBeVisible();
    });

    test("nonexistent profile slug returns 404", async ({ page }) => {
        const response = await page.goto("/en/profile/no-such-user-zzz-12345");
        expect(response?.status()).toBe(404);
    });
});
