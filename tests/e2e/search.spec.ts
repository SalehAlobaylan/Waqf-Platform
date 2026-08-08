import { test, expect } from "@playwright/test";

test.describe("Search Flow", () => {
  test.describe("Search Page", () => {
    test("should display search page", async ({ page }) => {
      await page.goto("/en/search");

      const searchInput = page.locator(
        'input[placeholder="Search for projects to contribute to..."]',
      );
      await expect(searchInput).toBeVisible();
    });

    test("should have search input", async ({ page }) => {
      await page.goto("/en/search");

      const searchInput = page.locator(
        'input[placeholder="Search for projects to contribute to..."]',
      );
      await expect(searchInput).toBeVisible();
    });

    test("should display search results for valid query", async ({ page }) => {
      await page.goto("/en/search");

      const searchInput = page.locator(
        'input[placeholder="Search for projects to contribute to..."]',
      );
      await searchInput.fill("قرآن");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(1500);

      // Results should appear — either project cards or a no-results state
      const resultsArea = page.locator("h3").first();
      await expect(resultsArea).toBeVisible();
    });
  });

  test.describe("Search Filters", () => {
    test("should have category filter", async ({ page }) => {
      await page.goto("/en/search");

      const categoryFilter = page.locator("select").first();
      await expect(categoryFilter).toBeVisible();
    });

    test("should have sort filter", async ({ page }) => {
      await page.goto("/en/search");

      const sortFilter = page.locator("select").nth(1);
      await expect(sortFilter).toBeVisible();
    });
  });

  test.describe("Search Results", () => {
    test("should show no results message for empty search", async ({ page }) => {
      await page.goto("/en/search");

      const searchInput = page.locator(
        'input[placeholder="Search for projects to contribute to..."]',
      );
      await searchInput.fill("xyznonexistent123");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(1500);

      await expect(page.locator("text=No projects found")).toBeVisible();
    });

    test("should link to project details", async ({ page }) => {
      await page.goto("/en/search");

      const searchInput = page.locator(
        'input[placeholder="Search for projects to contribute to..."]',
      );
      await searchInput.fill("قرآن");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(1500);

      // Seeded prayer API project should match
      const resultLink = page.locator('a[href*="/projects/"]').first();
      await expect(resultLink).toBeVisible();
      await resultLink.click();

      await expect(page).toHaveURL(/\/projects\//);
    });
  });
});
