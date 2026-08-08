import { test, expect } from "@playwright/test";
import { signInAs, SEEDED_USERS } from "./auth-helpers";

test.describe("Admin Flow", () => {
  test.describe("Admin Dashboard Access", () => {
    test("should redirect non-admin users from admin page", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      await page.goto("/en/admin");

      // Non-admins must not see the admin dashboard
      await page.waitForTimeout(1500);
      const url = page.url();
      expect(/\/admin/.test(url)).toBeFalsy();
    });

    test("should display admin dashboard for admin users", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.admin);

      await page.goto("/en/admin");

      await expect(page.locator("h1").last()).toContainText("Dashboard");
    });
  });

  test.describe("Admin Projects Management", () => {
    test("should display projects list in admin", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.admin);

      await page.goto("/en/admin/projects");

      const content = await page.content();
      expect(content.length).toBeGreaterThan(0);
      await expect(page.locator("h1").first()).toBeVisible();
    });

    test("should have project status badges", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.admin);

      await page.goto("/en/admin/projects");

      // Status badges render raw enum values (OPEN, PENDING, etc.)
      const statusBadge = page.getByText(/^(OPEN|PENDING|DRAFT|IN_PROGRESS|COMPLETED|CANCELLED)$/).first();
      await expect(statusBadge).toBeVisible();
    });
  });

  test.describe("Admin Users Management", () => {
    test("should display users list in admin", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.admin);

      await page.goto("/en/admin/users");

      const content = await page.content();
      expect(content.length).toBeGreaterThan(0);
      await expect(page.locator("h1").first()).toBeVisible();
    });

    test("should have user role badges", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.admin);

      await page.goto("/en/admin/users");

      // Seeded users include admin + regular users
      const adminBadge = page.locator("td span").filter({ hasText: /^Admin$/ }).first();
      await expect(adminBadge).toBeVisible();
      const userBadge = page.locator("td span").filter({ hasText: /^User$/ }).first();
      await expect(userBadge).toBeVisible();
    });
  });

  test.describe("Admin Analytics", () => {
    test("should display analytics page", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.admin);

      await page.goto("/en/admin/analytics");

      await expect(page.locator("h1").first()).toBeVisible();
    });

    test("should show statistics", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.admin);

      await page.goto("/en/admin/analytics");

      const pageText = await page.locator("body").innerText();
      expect(pageText.length).toBeGreaterThan(50);
    });
  });

  test.describe("Admin Navigation", () => {
    test("should have admin sidebar navigation", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.admin);

      await page.goto("/en/admin");

      const adminNav = page.locator("nav");
      await expect(adminNav.first()).toBeVisible();
    });

    test("should navigate between admin sections", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.admin);

      await page.goto("/en/admin");
      await page.waitForTimeout(1500);

      // Users section
      await page.click('a[href*="/admin/users"]');
      await expect(page).toHaveURL(/\/admin\/users/);

      // Projects section
      await page.click('a[href*="/admin/projects"]');
      await expect(page).toHaveURL(/\/admin\/projects/);

      // Analytics section
      await page.click('a[href*="/admin/analytics"]');
      await expect(page).toHaveURL(/\/admin\/analytics/);
    });
  });
});
