import { test, expect } from "@playwright/test";
import { signInAs, SEEDED_USERS } from "./auth-helpers";

test.describe("Messages Flow", () => {
  test.describe("Messages Page", () => {
    test("should display messages page for authenticated user", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      await page.goto("/en/dashboard/messages");

      await expect(page.locator("h1")).toContainText("Messages");
    });

    test("should show conversations list", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      await page.goto("/en/dashboard/messages");

      // Omar has seeded conversations (quran-tracker with admin)
      const conversations = page.locator('a[href*="/dashboard/applications/"]');
      await expect(conversations.first()).toBeVisible();
    });

    test("should show conversation with last message preview", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      await page.goto("/en/dashboard/messages");

      // Seeded conversations show a last-message preview in the list
      const preview = page.locator("body").getByText("يرجى الاطلاع على تصاميم", { exact: false });
      await expect(preview.first()).toBeVisible();
    });
  });

  test.describe("Access Control", () => {
    test("should redirect unauthenticated users from messages page", async ({ page }) => {
      await page.goto("/en/dashboard/messages");

      await expect(page).toHaveURL(/\/login/);
    });
  });
});
