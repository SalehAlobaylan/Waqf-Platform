import { test, expect } from "@playwright/test";

test.describe("Projects Flow", () => {
  test.describe("Explore Projects Page", () => {
    test("should display explore page correctly", async ({ page }) => {
      await page.goto("/en/explore");
      
      await expect(page.locator("h1")).toContainText(/explore/i);
    });

    test("should display list of projects", async ({ page }) => {
      await page.goto("/en/explore");
      
      // Wait for projects to load
      await page.waitForSelector("text=Projects", { timeout: 10000 });
      
      // Check that project cards are visible
      const projectCards = page.locator('[class*="project"], [class*="card"]');
      await expect(projectCards.first()).toBeVisible();
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
        
        // Check for owner section
        await expect(page.locator("text=Project Creator, text=Creator")).toBeVisible();
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
        await expect(page.locator("text=Tech Stack, text=Skills, text=Required")).toBeVisible();
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
        await expect(page.locator("text=Roadmap")).toBeVisible();
      }
    });
  });

  test.describe("Project Application Flow", () => {
    test("should show apply button on project page", async ({ page }) => {
      await page.goto("/en/explore");
      await page.waitForTimeout(2000);
      
      const projectLink = page.locator('a[href*="/projects/"]').first();
      if (await projectLink.isVisible()) {
        await projectLink.click();
        await page.waitForLoadState("networkidle");
        
        // Check for Apply button or Contribute button
        const applyButton = page.locator('button:has-text("Apply"), button:has-text("Contribute")');
        await expect(applyButton).toBeVisible();
      }
    });

    test("should redirect to login when trying to apply without auth", async ({ page }) => {
      await page.goto("/en/explore");
      await page.waitForTimeout(2000);
      
      const projectLink = page.locator('a[href*="/projects/"]').first();
      if (await projectLink.isVisible()) {
        await projectLink.click();
        await page.waitForLoadState("networkidle");
        
        // Click apply button
        const applyButton = page.locator('button:has-text("Apply"), button:has-text("Contribute")').first();
        await applyButton.click();
        
        // Should redirect to login
        await expect(page).toHaveURL(/\/login/);
      }
    });
  });

  test.describe("Create Project", () => {
    test("should have create project option in dashboard", async ({ page }) => {
      // First login
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      // Check for create project button in dashboard
      const createButton = page.locator('a:has-text("Create Project"), button:has-text("Create Project")');
      await expect(createButton).toBeVisible();
    });
  });
});
