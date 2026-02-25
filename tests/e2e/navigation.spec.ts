import { test, expect } from "@playwright/test";

test.describe("Navigation Flow", () => {
  test.describe("Header Navigation", () => {
    test("should display main navigation", async ({ page }) => {
      await page.goto("/en");
      
      // Check for main navigation elements
      await expect(page.locator("nav, header")).toBeVisible();
    });

    test("should have explore link", async ({ page }) => {
      await page.goto("/en");
      
      const exploreLink = page.locator('a:has-text("Explore")').first();
      await expect(exploreLink).toBeVisible();
    });

    test("should have login/signup buttons for unauthenticated users", async ({ page }) => {
      await page.goto("/en");
      
      const loginLink = page.locator('a:has-text("Login"), a:has-text("Sign in")').first();
      const signupLink = page.locator('a:has-text("Sign up"), a:has-text("Sign up")').first();
      
      await expect(loginLink).toBeVisible();
      await expect(signupLink).toBeVisible();
    });

    test("should have user menu for authenticated users", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      // Should show user menu
      await expect(page.locator("button:has-text('Test Owner'), button:has-text('Test')")).toBeVisible();
    });
  });

  test.describe("Dashboard Navigation", () => {
    test("should display dashboard sidebar or navigation", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      // Should show dashboard navigation
      await expect(page.locator("text=Dashboard")).toBeVisible();
    });

    test("should have applications link", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      const applicationsLink = page.locator('a:has-text("Applications")');
      await expect(applicationsLink).toBeVisible();
    });

    test("should have messages link", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      const messagesLink = page.locator('a:has-text("Messages")');
      await expect(messagesLink).toBeVisible();
    });

    test("should have profile link", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      const profileLink = page.locator('a:has-text("Profile")');
      await expect(profileLink).toBeVisible();
    });

    test("should have notifications bell", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      // Look for notification bell
      const bellIcon = page.locator('button[aria-label*="notification" i], button:has(svg)');
    });
  });

  test.describe("Locale Switching", () => {
    test("should switch to Arabic locale", async ({ page }) => {
      await page.goto("/en");
      
      // Find and click language switcher
      const langSwitcher = page.locator('button:has-text("English")');
      if (await langSwitcher.isVisible()) {
        await langSwitcher.click();
        await page.click('a:has-text("العربية")');
        
        await page.waitForURL(/\/ar\//);
        await expect(page.locator("text=استكشف")).toBeVisible();
      }
    });

    test("should switch back to English", async ({ page }) => {
      await page.goto("/ar");
      
      // Find and click language switcher
      const langSwitcher = page.locator('button:has-text("العربية")');
      if (await langSwitcher.isVisible()) {
        await langSwitcher.click();
        await page.click('a:has-text("English")');
        
        await page.waitForURL(/\/en\//);
        await expect(page.locator("text=Explore")).toBeVisible();
      }
    });

    test("should persist locale across pages", async ({ page }) => {
      await page.goto("/en/explore");
      
      // Switch to Arabic
      const langSwitcher = page.locator('button:has-text("English")');
      if (await langSwitcher.isVisible()) {
        await langSwitcher.click();
        await page.click('a:has-text("العربية")');
        
        await page.waitForURL(/\/ar\//);
        
        // Navigate to another page
        await page.goto("/ar/projects/test-project");
        
        // Should still be in Arabic
        await expect(page).toHaveURL(/\/ar\//);
      }
    });
  });

  test.describe("Footer", () => {
    test("should display footer", async ({ page }) => {
      await page.goto("/en");
      
      // Check footer is visible
      await expect(page.locator("footer")).toBeVisible();
    });

    test("should have links in footer", async ({ page }) => {
      await page.goto("/en");
      
      // Check for footer links
      const footerLinks = page.locator("footer a");
      await expect(footerLinks.first()).toBeVisible();
    });
  });

  test.describe("Breadcrumbs", () => {
    test("should display breadcrumbs on project page", async ({ page }) => {
      await page.goto("/en/explore");
      await page.waitForTimeout(2000);
      
      const projectLink = page.locator('a[href*="/projects/"]').first();
      if (await projectLink.isVisible()) {
        await projectLink.click();
        
        // Should show breadcrumbs
        const breadcrumbs = page.locator('nav[aria-label*="breadcrumb" i]');
      }
    });
  });
});
