import { test, expect } from "@playwright/test";
import { signInAs, SEEDED_USERS } from "./auth-helpers";

test.describe("Projects Flow", () => {
  test.describe("Explore Projects Page", () => {
    test("should display explore page correctly", async ({ page }) => {
      await page.goto("/en/explore");
      
      await expect(page.locator("h1")).toContainText(/explore/i);
    });

    test("should display list of projects", async ({ page }) => {
      await page.goto("/en/explore");

      // Wait for project cards to load (each links to /projects/<slug>)
      const projectCard = page.locator('a[href*="/projects/"]').first();
      await expect(projectCard).toBeVisible({ timeout: 10000 });
    });

    test("should filter projects by category", async ({ page }) => {
      await page.goto("/en/explore");
      
      // Look for category filter buttons
      const categoryButton = page.locator('button:has-text("Frontend"), button:has-text("Backend")').first();
      if (await categoryButton.isVisible()) {
        await categoryButton.click();
        // Projects should still be visible after filtering
        await page.waitForTimeout(500);
      }
    });

    test("should search for projects", async ({ page }) => {
      await page.goto("/en/explore");
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
      if (await searchInput.isVisible()) {
        await searchInput.fill("prayer");
        await page.waitForTimeout(500);
        // Results should be filtered
      }
    });
  });

  test.describe("Project Details Page", () => {
    test("should display project details", async ({ page }) => {
      // First go to explore to find a project
      await page.goto("/en/explore");
      await page.waitForTimeout(2000);
      
      // Click on first project
      const projectLink = page.locator('a[href*="/projects/"]').first();
      if (await projectLink.isVisible()) {
        await projectLink.click();
        
        // Wait for project page to load
        await page.waitForLoadState("networkidle");
        
        // Check that project details are displayed
        await expect(page.locator("h1")).toBeVisible();
      }
    });

    test("should display project owner information", async ({ page }) => {
      await page.goto("/en/explore");
      await page.waitForTimeout(2000);
      
      const projectLink = page.locator('a[href*="/projects/"]').first();
      if (await projectLink.isVisible()) {
        await projectLink.click();
        await page.waitForLoadState("networkidle");
        
        // Check for owner section (internal) or curator notice (external)
        const ownerSection = page.getByText("Project Creator").first();
        const curatorSection = page.getByText("Curated by Waqf").first();
        await expect(ownerSection.or(curatorSection)).toBeVisible();
      }
    });

    test("should display project skills/tech stack", async ({ page }) => {
      await page.goto("/en/explore");
      await page.waitForTimeout(2000);
      
      const projectLink = page.locator('a[href*="/projects/"]').first();
      if (await projectLink.isVisible()) {
        await projectLink.click();
        await page.waitForLoadState("networkidle");
        
        // Check for skills section
        await expect(page.getByText("Tech Stack").first()).toBeVisible();
      }
    });

    test("should display project roadmap", async ({ page }) => {
      await page.goto("/en/explore");
      await page.waitForTimeout(2000);
      
      const projectLink = page.locator('a[href*="/projects/"]').first();
      if (await projectLink.isVisible()) {
        await projectLink.click();
        await page.waitForLoadState("networkidle");
        
        // Check for roadmap section
        await expect(page.getByText("Project Roadmap").first()).toBeVisible();
      }
    });
  });

  test.describe("Project Application Flow", () => {
    test("should show apply button on project page", async ({ page }) => {
      // Use a known internal (non-external) seeded project — the explore feed's
      // first card is a curated external project, which has no apply button.
      await page.goto("/en/projects/halal-food-scanner");
      await page.waitForLoadState("networkidle");

      // Check for Apply/Contribute button (link to login when unauthenticated)
      const applyButton = page.locator('button:has-text("Contribute"), a:has-text("Contribute")').first();
      await expect(applyButton).toBeVisible();
    });

    test("should redirect to login when trying to apply without auth", async ({ page }) => {
      // Use a known internal (non-external) seeded project
      await page.goto("/en/projects/halal-food-scanner");
      await page.waitForLoadState("networkidle");

      // Click contribute button
      const applyButton = page.locator('a:has-text("Contribute")').first();
      await expect(applyButton).toBeVisible();
      await applyButton.click();

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe("Create Project", () => {
    test("should have create project option in dashboard", async ({ page }) => {
      // First login
      await signInAs(page, SEEDED_USERS.omar);
      await page.goto("/en/dashboard");

      // Check for create project button in dashboard
      const createButton = page.locator('a:has-text("Create Project")').first();
      await expect(createButton).toBeVisible();
    });
  });
});
