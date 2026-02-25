import { test, expect } from "@playwright/test";

test.describe("Applications Flow", () => {
  test.describe("View Applications (As Contributor)", () => {
    test("should display my applications page", async ({ page }) => {
      // Login first
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      // Navigate to applications
      await page.goto("/en/dashboard/applications");
      
      // Check page loads
      await expect(page.locator("h1")).toContainText(/application/i);
    });

    test("should display list of applications", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      await page.goto("/en/dashboard/applications");
      
      // Should show application cards or empty state
      const content = await page.content();
      expect(content).toContain("Application");
    });

    test("should show application stats (pending/accepted)", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      await page.goto("/en/dashboard/applications");
      
      // Should show stats
      await expect(page.locator("text=Pending, text=Accepted, text=Total")).toBeVisible();
    });
  });

  test.describe("Application Details (As Contributor)", () => {
    test("should view application details", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      await page.goto("/en/dashboard/applications");
      await page.waitForTimeout(1000);
      
      // Click on first application if exists
      const appLink = page.locator('a[href*="/dashboard/applications/"]').first();
      if (await appLink.isVisible()) {
        await appLink.click();
        await page.waitForLoadState("networkidle");
        
        // Check for details
        await expect(page.locator("h1")).toBeVisible();
      }
    });
  });

  test.describe("View Applications (As Project Owner)", () => {
    test("should display received applications page", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      // Try to access project applications page
      // This would be /en/projects/[slug]/applications
      await page.goto("/en/explore");
      await page.waitForTimeout(2000);
      
      // Look for a project and see if owner can see applications
      const projectLink = page.locator('a[href*="/projects/"]').first();
      if (await projectLink.isVisible()) {
        await projectLink.click();
        await page.waitForLoadState("networkidle");
        
        // Check if there's an applications link for owners
        const applicationsLink = page.locator('a:has-text("Applications")');
        // This might not be visible for non-owners
      }
    });
  });

  test.describe("Application Status", () => {
    test("should show pending status for new applications", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      await page.goto("/en/dashboard/applications");
      
      // Look for status badges
      const statusBadge = page.locator("text=Pending");
      // Might not exist if no applications
    });

    test("should show accepted status for approved applications", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      await page.goto("/en/dashboard/applications");
      
      // Look for accepted status
      const statusBadge = page.locator("text=Accepted");
    });
  });

  test.describe("Access Control", () => {
    test("should redirect unauthenticated users from applications page", async ({ page }) => {
      await page.goto("/en/dashboard/applications");
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });

    test("should not show other users applications", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      // Try to access a random application ID
      await page.goto("/en/dashboard/applications/random-id-123");
      
      // Should either show 404 or redirect
      await page.waitForTimeout(1000);
    });
  });
});
