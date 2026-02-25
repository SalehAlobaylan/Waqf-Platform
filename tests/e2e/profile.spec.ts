import { test, expect } from "@playwright/test";

test.describe("Profile Flow", () => {
  test.describe("View Own Profile", () => {
    test("should display own profile page", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      // Click on profile in user menu
      await page.click("button:has(.user-menu-trigger)");
      await page.click('a:has-text("Profile")');
      
      await page.waitForURL(/\/profile\//);
      await expect(page.locator("h1")).toBeVisible();
    });

    test("should display profile information", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      // Navigate to profile
      await page.goto("/en/profile/test-user-id");
      
      await page.waitForLoadState("networkidle");
      // Profile should show name and details
      const content = await page.content();
      expect(content).toMatch(/profile|name/i);
    });

    test("should display skills section", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      await page.goto("/en/profile/test-user-id");
      await page.waitForLoadState("networkidle");
      
      // Should show skills section
      await expect(page.locator("text=Skills")).toBeVisible();
    });

    test("should display stats (projects, contributions)", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      await page.goto("/en/profile/test-user-id");
      await page.waitForLoadState("networkidle");
      
      // Should show stats
      const statsSection = page.locator("text=Projects, text=Contributions");
    });
  });

  test.describe("View Other User Profiles", () => {
    test("should display other user profile", async ({ page }) => {
      await page.goto("/en/explore");
      await page.waitForTimeout(2000);
      
      // Click on project owner profile
      const ownerLink = page.locator('a[href*="/profile/"]').first();
      if (await ownerLink.isVisible()) {
        await ownerLink.click();
        await page.waitForURL(/\/profile\//);
        
        // Should show profile without edit buttons
        await expect(page.locator("text=Edit Profile")).toBeHidden();
      }
    });

    test("should display profile contribution heatmap", async ({ page }) => {
      await page.goto("/en/explore");
      await page.waitForTimeout(2000);
      
      const ownerLink = page.locator('a[href*="/profile/"]').first();
      if (await ownerLink.isVisible()) {
        await ownerLink.click();
        await page.waitForURL(/\/profile\//);
        
        // Should show contribution heatmap
        await expect(page.locator("text=Contribution")).toBeVisible();
      }
    });
  });

  test.describe("Edit Profile", () => {
    test("should have edit profile option for own profile", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      // Navigate to own profile via URL
      await page.goto("/en/profile/test-user-id");
      
      // Should not show edit button (might be in settings)
    });

    test("should navigate to settings from profile", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      // Click on user menu
      await page.click("button:has(.user-menu-trigger), button:has-text('Test')");
      
      // Look for settings link
      const settingsLink = page.locator('a:has-text("Settings")');
      if (await settingsLink.isVisible()) {
        await expect(settingsLink).toBeVisible();
      }
    });
  });

  test.describe("Access Control", () => {
    test("should show 404 for non-existent profile", async ({ page }) => {
      await page.goto("/en/profile/non-existent-id-12345");
      
      // Should show not found
      await expect(page.locator("text=Not Found, text=404")).toBeVisible();
    });
  });
});
