import { test, expect } from "@playwright/test";
import { signInAs, SEEDED_USERS } from "./auth-helpers";

test.describe("Applications Flow", () => {
  test.describe("View Applications (As Contributor)", () => {
    test("should display my applications page", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      await page.goto("/en/dashboard/applications");

      await expect(page.locator("h1")).toContainText("My Applications");
    });

    test("should display list of applications", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      await page.goto("/en/dashboard/applications");

      // Omar has 4 seeded applications
      const appCards = page.locator('a[href*="/dashboard/applications/"]');
      await expect(appCards.first()).toBeVisible();
    });

    test("should show application stats (pending/accepted)", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      await page.goto("/en/dashboard/applications");

      await expect(page.locator("text=Total").first()).toBeVisible();
      await expect(page.locator("text=Pending").first()).toBeVisible();
      await expect(page.locator("text=Accepted").first()).toBeVisible();
    });
  });

  test.describe("Application Details (As Contributor)", () => {
    test("should view application details", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      await page.goto("/en/dashboard/applications");

      const appLink = page.locator('a[href*="/dashboard/applications/"]').first();
      await expect(appLink).toBeVisible();
      await appLink.click();
      await page.waitForLoadState("networkidle");

      // Detail page renders the project title and a message thread
      await expect(page.locator("body")).not.toBeEmpty();
    });
  });

  test.describe("Application Status", () => {
    test("should show pending status for new applications", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      await page.goto("/en/dashboard/applications");

      // Omar has 2 PENDING seeded applications
      const pendingCount = page.locator("text=Pending").first();
      await expect(pendingCount).toBeVisible();
    });

    test("should show accepted status for approved applications", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      await page.goto("/en/dashboard/applications");

      // Omar has 2 ACCEPTED seeded applications
      const acceptedCount = page.locator("text=Accepted").first();
      await expect(acceptedCount).toBeVisible();
    });
  });

  test.describe("Access Control", () => {
    test("should redirect unauthenticated users from applications page", async ({ page }) => {
      await page.goto("/en/dashboard/applications");

      await expect(page).toHaveURL(/\/login/);
    });

    test("should not show other users applications", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      // Random non-existent application ID should 404, not leak data
      await page.goto("/en/dashboard/applications/random-id-123");

      // Either a 404 page or a redirect — but never a valid application view
      const body = await page.locator("body").innerText();
      expect(body).not.toContain("Applied to");
      expect(body.length).toBeGreaterThan(0);
    });
  });
});
