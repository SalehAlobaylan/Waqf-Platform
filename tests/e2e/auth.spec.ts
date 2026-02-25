import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  const uniqueEmail = `test-${Date.now()}@example.com`;
  const testPassword = "TestPass123";

  test.describe("User Registration (Signup)", () => {
    test("should display signup form correctly", async ({ page }) => {
      await page.goto("/en/signup");
      
      await expect(page.locator("h1")).toContainText(/create your account/i);
      await expect(page.locator('input[name="name"]')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('input[id="confirmPassword"]')).toBeVisible();
      await expect(page.locator('input[id="terms"]')).toBeVisible();
    });

    test("should show error for password not meeting requirements", async ({ page }) => {
      await page.goto("/en/signup");
      
      await page.fill('input[name="name"]', "Test User");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "weak");
      await page.fill('input[id="confirmPassword"]', "weak");
      await page.check('input[id="terms"]');
      await page.click('button[type="submit"]');
      
      await expect(page.locator("text=password")).toBeVisible();
    });

    test("should show error for password mismatch", async ({ page }) => {
      await page.goto("/en/signup");
      
      await page.fill('input[name="name"]', "Test User");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.fill('input[id="confirmPassword"]', "DifferentPass123");
      await page.check('input[id="terms"]');
      await page.click('button[type="submit"]');
      
      await expect(page.locator("text=match")).toBeVisible();
    });

    test("should show error for terms not accepted", async ({ page }) => {
      await page.goto("/en/signup");
      
      await page.fill('input[name="name"]', "Test User");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.fill('input[id="confirmPassword"]', "TestPass123");
      await page.click('button[type="submit"]');
      
      await expect(page.locator("text=terms")).toBeVisible();
    });

    test("should successfully register a new user", async ({ page }) => {
      await page.goto("/en/signup");
      
      await page.fill('input[name="name"]', "New Test User");
      await page.fill('input[type="email"]', uniqueEmail);
      await page.fill('input[type="password"]', testPassword);
      await page.fill('input[id="confirmPassword"]', testPassword);
      await page.check('input[id="terms"]');
      await page.click('button[type="submit"]');
      
      // Should redirect to onboarding or dashboard
      await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 });
    });

    test("should show error for duplicate email", async ({ page }) => {
      await page.goto("/en/signup");
      
      await page.fill('input[name="name"]', "Duplicate User");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', testPassword);
      await page.fill('input[id="confirmPassword"]', testPassword);
      await page.check('input[id="terms"]');
      await page.click('button[type="submit"]');
      
      // Should show error about email already exists
      await expect(page.locator("text=email, text=exists")).toBeVisible();
    });
  });

  test.describe("User Login", () => {
    test("should display login form correctly", async ({ page }) => {
      await page.goto("/en/login");
      
      await expect(page.locator("h1")).toContainText(/welcome back/i);
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test("should show error for invalid credentials", async ({ page }) => {
      await page.goto("/en/login");
      
      await page.fill('input[type="email"]', "nonexistent@test.com");
      await page.fill('input[type="password"]', "wrongpassword");
      await page.click('button[type="submit"]');
      
      await expect(page.locator("text=invalid")).toBeVisible();
    });

    test("should successfully login with valid credentials", async ({ page }) => {
      await page.goto("/en/login");
      
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', testPassword);
      await page.click('button[type="submit"]');
      
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      await expect(page.locator("text=Dashboard")).toBeVisible();
    });

    test("should have link to signup page", async ({ page }) => {
      await page.goto("/en/login");
      
      const signupLink = page.locator('a:has-text("sign up")');
      await expect(signupLink).toBeVisible();
      await expect(signupLink).toHaveAttribute("href", "/en/signup");
    });
  });

  test.describe("GitHub OAuth", () => {
    test("should have GitHub login button", async ({ page }) => {
      await page.goto("/en/login");
      
      const githubButton = page.locator('button:has-text("GitHub")');
      await expect(githubButton).toBeVisible();
    });

    test("should have GitHub signup button", async ({ page }) => {
      await page.goto("/en/signup");
      
      const githubButton = page.locator('button:has-text("GitHub")');
      await expect(githubButton).toBeVisible();
    });
  });

  test.describe("Locale Switching", () => {
    test("should switch between English and Arabic", async ({ page }) => {
      await page.goto("/en/login");
      
      // Check English content
      await expect(page.locator("h1")).toContainText(/welcome back/i);
      
      // Switch to Arabic
      await page.click('button:has-text("English")');
      await page.click('a:has-text("العربية")');
      
      // Wait for URL to change
      await page.waitForURL(/\/ar\//);
      
      // Check Arabic content
      await expect(page.locator("h1")).toContainText(/تسجيل/i);
    });
  });
});
