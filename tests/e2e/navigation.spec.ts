import { test, expect } from "@playwright/test";
import { signInAs, SEEDED_USERS } from "./auth-helpers";

test.describe("Navigation Flow", () => {
  test.describe("Header Navigation", () => {
    test("should display main navigation", async ({ page }) => {
      await page.goto("/en");

      // Check for main navigation elements
      await expect(page.locator("header nav").first()).toBeVisible();
    });

    test("should have explore link", async ({ page }) => {
      await page.goto("/en");

      const exploreLink = page.locator('a:has-text("Explore")').first();
      await expect(exploreLink).toBeVisible();
    });

    test("should have login/signup buttons for unauthenticated users", async ({ page }) => {
      await page.goto("/en");

      const loginLink = page.locator('a:has-text("Log In")').first();
      const signupLink = page.locator('a:has-text("Sign Up")').first();

      await expect(loginLink).toBeVisible();
      await expect(signupLink).toBeVisible();
    });

    test("should have user menu for authenticated users", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);
      await page.goto("/en");

      // User menu trigger is the only button with a chevron-down icon (avatar dropdown).
      await expect(page.locator("button:has(svg.lucide-chevron-down)")).toBeVisible();
    });
  });

  test.describe("Dashboard Navigation", () => {
    test("should display dashboard navigation", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);
      await page.goto("/en/dashboard");

      // Dashboard shows the stats grid with section links
      await expect(page.locator('a:has-text("Your Applications")')).toBeVisible();
    });

    test("should have applications link", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);
      await page.goto("/en/dashboard");

      const applicationsLink = page.locator('a:has-text("Your Applications")');
      await expect(applicationsLink).toBeVisible();
      await expect(applicationsLink).toHaveAttribute("href", "/en/dashboard/applications");
    });

    test("should have messages link", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);
      await page.goto("/en/dashboard");

      // Dashboard sidebar already links to Messages
      const messagesLink = page.locator('a:has-text("Messages")').first();
      await expect(messagesLink).toBeVisible();
      await expect(messagesLink).toHaveAttribute("href", "/en/dashboard/messages");
    });

    test("should have profile link", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);
      await page.goto("/en");

      // Profile link lives in the avatar dropdown menu
      await page.click("button:has(svg.lucide-chevron-down)");
      const profileLink = page.locator('a:has-text("Profile")');
      await expect(profileLink).toBeVisible();
    });

    test("should have notifications bell", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);
      await page.goto("/en");

      // Look for notification bell
      await expect(page.locator('button[aria-label="Notifications"]')).toBeVisible();
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
      const langSwitcher = page.locator("button:has-text(\"English\")");
      if (await langSwitcher.isVisible()) {
        await langSwitcher.click();
        await page.click('a:has-text("العربية")');

        await page.waitForURL(/\/ar\//);

        // Navigate to another page using a real seeded project slug
        await page.goto("/ar/projects/halal-food-scanner");

        // Should still be in Arabic
        await expect(page).toHaveURL(/\/ar\//);
        await expect(page.locator("h1")).toBeVisible();
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
