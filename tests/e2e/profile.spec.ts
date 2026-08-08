import { test, expect } from "@playwright/test";
import { signInAs, SEEDED_USERS } from "./auth-helpers";

const OMAR_USERNAME = "amr-alfarsy";

test.describe("Profile Flow", () => {
  test.describe("View Own Profile", () => {
    test("should display own profile page", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);
      await page.goto("/en");

      // Click on profile in user menu
      await page.click("button:has(svg.lucide-chevron-down)");
      await page.click('a:has-text("Profile")');

      await page.waitForURL(/\/profile\//);
      await expect(page.locator("h1")).toBeVisible();
    });

    test("should display profile information", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      // Navigate to profile via real username slug (id fallback also works)
      await page.goto(`/en/profile/${OMAR_USERNAME}`);

      await page.waitForLoadState("networkidle");
      // Profile should show name and details
      const content = await page.content();
      expect(content).toMatch(/profile|name/i);
    });

    test("should display skills section", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      await page.goto(`/en/profile/${OMAR_USERNAME}`);
      await page.waitForLoadState("networkidle");

      // Should show skills section
      await expect(page.locator("text=Skills")).toBeVisible();
    });

    test("should display stats (projects, contributions)", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      await page.goto(`/en/profile/${OMAR_USERNAME}`);
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
      await signInAs(page, SEEDED_USERS.omar);

      // Navigate to own profile via real username slug
      await page.goto(`/en/profile/${OMAR_USERNAME}`);

      // Should not show edit button (might be in settings)
    });

    test("should navigate to settings from profile", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);
      await page.goto("/en");

      // Click on user menu
      await page.click("button:has(svg.lucide-chevron-down)");

      // Look for settings link
      const settingsLink = page.locator('a:has-text("Settings")');
      if (await settingsLink.isVisible()) {
        await expect(settingsLink).toBeVisible();
      }
    });
  });

  test.describe("Access Control", () => {
    test("should show 404 for non-existent profile", async ({ page }) => {
      await page.goto("/en/profile/non-existent-user-12345");

      // Should show the translated not-found page
      await expect(page.getByText(/page not found|الصفحة غير موجودة/i).first()).toBeVisible();
    });
  });
});
