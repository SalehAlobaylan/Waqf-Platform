import { test, expect } from "@playwright/test";
import { signInAs, SEEDED_USERS } from "./auth-helpers";

test.describe("Notifications Flow", () => {
  test.describe("Notification Bell", () => {
    test("should display notification bell for authenticated users", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      await page.goto("/en");

      const bellButton = page.locator('button[aria-label="Notifications"]');
      await expect(bellButton).toBeVisible();
    });

    test("should show notification dropdown when clicked", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      await page.goto("/en");

      const bellButton = page.locator('button[aria-label="Notifications"]');
      await bellButton.click();

      await expect(page.locator("text=Notifications").first()).toBeVisible();
    });

    test("should show unread count badge when unread notifications exist", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);
      await page.goto("/en");

      // Omar has a seeded unread NEW_MESSAGE notification
      const badge = page.locator('button[aria-label="Notifications"] span');
      await expect(badge.first()).toBeVisible();
    });
  });

  test.describe("Notification Actions", () => {
    test("should have mark all as read button with unread notifications", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      await page.goto("/en");

      const bellButton = page.locator('button[aria-label="Notifications"]');
      await bellButton.click();

      await expect(page.locator("text=Mark all read")).toBeVisible();
    });

    test("should mark all as read when clicked", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      await page.goto("/en");

      const bellButton = page.locator('button[aria-label="Notifications"]');
      await bellButton.click();

      await page.locator("text=Mark all read").click();

      // Badge disappears once everything is read
      const badge = page.locator('button[aria-label="Notifications"] span');
      await expect(badge).toHaveCount(0);
    });
  });

  test.describe("Access Control", () => {
    test("should not show notification bell for unauthenticated users", async ({ page }) => {
      await page.goto("/en");

      const bellButton = page.locator('button[aria-label="Notifications"]');
      await expect(bellButton).toHaveCount(0);
    });
  });
});
