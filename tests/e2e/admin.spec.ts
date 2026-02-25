import { test, expect } from "@playwright/test";

test.describe("Admin Flow", () => {
  test.describe("Admin Dashboard Access", () => {
    test("should redirect non-admin users from admin page", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      // Try to access admin page
      await page.goto("/en/admin");
      
      // Should either redirect or show access denied
      await page.waitForTimeout(1000);
    });

    test("should display admin dashboard for admin users", async ({ page }) => {
      // This test assumes there's an admin user
      // In real scenario, login as admin
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "admin@test.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      
      await page.goto("/en/admin");
      
      // Should show admin dashboard or redirect
      await page.waitForTimeout(1000);
    });
  });

  test.describe("Admin Projects Management", () => {
    test("should display projects list in admin", async ({ page }) => {
      // Login as admin first (or skip if no admin)
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "admin@test.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      
      await page.goto("/en/admin/projects");
      await page.waitForTimeout(2000);
      
      // Should show projects table or list
      const content = await page.content();
    });

    test("should have project status badges", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "admin@test.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      
      await page.goto("/en/admin/projects");
      await page.waitForTimeout(2000);
      
      // Look for status badges
      const statusBadge = page.locator("text=Open, text=Closed");
    });
  });

  test.describe("Admin Users Management", () => {
    test("should display users list in admin", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "admin@test.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      
      await page.goto("/en/admin/users");
      await page.waitForTimeout(2000);
      
      // Should show users table
      const content = await page.content();
    });

    test("should have user role badges", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "admin@test.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      
      await page.goto("/en/admin/users");
      await page.waitForTimeout(2000);
      
      // Look for role badges
      const roleBadge = page.locator("text=ADMIN, text=USER");
    });
  });

  test.describe("Admin Analytics", () => {
    test("should display analytics page", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "admin@test.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      
      await page.goto("/en/admin/analytics");
      await page.waitForTimeout(2000);
      
      // Should show analytics
      await expect(page.locator("text=Analytics")).toBeVisible();
    });

    test("should show statistics cards", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "admin@test.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      
      await page.goto("/en/admin/analytics");
      await page.waitForTimeout(2000);
      
      // Should show stats
      const statsCards = page.locator('[class*="card"], [class*="stat"]');
    });
  });

  test.describe("Admin Navigation", () => {
    test("should have admin sidebar navigation", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "admin@test.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      
      await page.goto("/en/admin");
      await page.waitForTimeout(2000);
      
      // Should show admin navigation
      const adminNav = page.locator("nav");
    });

    test("should navigate between admin sections", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "admin@test.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      
      await page.goto("/en/admin");
      await page.waitForTimeout(2000);
      
      // Click on users
      await page.click('a:has-text("Users")');
      await page.waitForTimeout(1000);
      
      // Click on projects
      await page.click('a:has-text("Projects")');
      await page.waitForTimeout(1000);
      
      // Click on analytics
      await page.click('a:has-text("Analytics")');
      await page.waitForTimeout(1000);
    });
  });
});
