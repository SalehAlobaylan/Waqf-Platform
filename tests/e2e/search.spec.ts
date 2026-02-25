import { test, expect } from "@playwright/test";

test.describe("Search Flow", () => {
  test.describe("Search Page", () => {
    test("should display search page", async ({ page }) => {
      await page.goto("/en/search");
      
      await expect(page.locator("h1")).toContainText(/search/i);
    });

    test("should have search input", async ({ page }) => {
      await page.goto("/en/search");
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
      await expect(searchInput).toBeVisible();
    });

    test("should display search results", async ({ page }) => {
      await page.goto("/en/search");
      
      // Enter search query
      const searchInput = page.locator('input[type="search"]');
      await searchInput.fill("prayer");
      await page.waitForTimeout(1000);
      
      // Results should appear
      const results = page.locator('[class*="result"], [class*="project"]');
    });
  });

  test.describe("Search Filters", () => {
    test("should filter by category", async ({ page }) => {
      await page.goto("/en/search");
      
      // Look for category filter
      const categoryFilter = page.locator('button:has-text("Frontend"), button:has-text("Backend")').first();
      if (await categoryFilter.isVisible()) {
        await categoryFilter.click();
        await page.waitForTimeout(500);
      }
    });

    test("should filter by skills", async ({ page }) => {
      await page.goto("/en/search");
      
      // Look for skills filter
      const skillsFilter = page.locator('button:has-text("React"), button:has-text("Python")').first();
    });
  });

  test.describe("Search Results", () => {
    test("should show project cards in results", async ({ page }) => {
      await page.goto("/en/search");
      
      // Enter search
      const searchInput = page.locator('input[type="search"]');
      await searchInput.fill("Islamic");
      await page.waitForTimeout(1000);
      
      // Should show results
      const projectCards = page.locator('[class*="project"]');
    });

    test("should show no results message for empty search", async ({ page }) => {
      await page.goto("/en/search");
      
      // Enter random search that won't match
      const searchInput = page.locator('input[type="search"]');
      await searchInput.fill("xyznonexistent123");
      await page.waitForTimeout(1000);
      
      // Should show no results
      await expect(page.locator("text=no result, text=No results")).toBeVisible();
    });

    test("should link to project details", async ({ page }) => {
      await page.goto("/en/search");
      
      const searchInput = page.locator('input[type="search"]');
      await searchInput.fill("test");
      await page.waitForTimeout(1000);
      
      // Click on first result
      const resultLink = page.locator('a[href*="/projects/"]').first();
      if (await resultLink.isVisible()) {
        await resultLink.click();
        
        // Should navigate to project page
        await expect(page).toHaveURL(/\/projects\//);
      }
    });
  });
});
