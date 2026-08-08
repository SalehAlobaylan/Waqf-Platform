import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { signInAs, SEEDED_USERS } from "./auth-helpers";

const prisma = new PrismaClient();

test.describe("Authentication Flow (Passwordless)", () => {
  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test.describe("Login Form", () => {
    test("should display login form with all passwordless options", async ({ page }) => {
      await page.goto("/en/login");

      await expect(page.locator("h1")).toContainText(/welcome back/i);
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('button:has-text("GitHub")')).toBeVisible();
      await expect(page.locator('button:has-text("Google")')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      // No password field
      await expect(page.locator('input[type="password"]')).toHaveCount(0);
    });

    test("should have link to signup page", async ({ page }) => {
      await page.goto("/en/login");

      const signupLink = page.getByRole("link", { name: "Sign up", exact: true });
      await expect(signupLink).toBeVisible();
      await expect(signupLink).toHaveAttribute("href", "/en/signup");
    });

    test("should send a magic link to a valid email", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', SEEDED_USERS.omar);

      const initialCount = await prisma.verification.count({
        where: { value: { contains: SEEDED_USERS.omar } },
      });

      await page.click('button[type="submit"]');

      await expect(page.locator("text=/check your inbox/i")).toBeVisible({
        timeout: 10000,
      });

      // Magic link records store the email in the JSON value (identifier is a
      // random token), so assert by value.
      const afterCount = await prisma.verification.count({
        where: { value: { contains: SEEDED_USERS.omar } },
      });
      expect(afterCount).toBeGreaterThan(initialCount);
    });

    test("should sign in via dev helper for a seeded user", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);
      await page.goto("/en/dashboard");
      await expect(page).toHaveURL(/\/en\/dashboard/);
    });

    test("should reject unknown email from dev helper", async ({ page }) => {
      const response = await page.request.post("/api/dev/sign-in-as", {
        data: { email: "nobody-here@example.com" },
      });
      expect(response.status()).toBe(404);
    });
  });

  test.describe("OTP Fallback", () => {
    test("should switch to OTP mode and complete sign-in", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', SEEDED_USERS.fatima);
      await page.click('button[type="submit"]');
      await expect(page.locator("text=/check your inbox/i")).toBeVisible({
        timeout: 10000,
      });

      await page.click('button:has-text("Use a 6-digit code")');

      await expect(page.locator('input[inputmode="numeric"]')).toHaveCount(6);

      // Wait for the OTP to be stored
      await expect
        .poll(
          async () => {
            const records = await prisma.verification.findMany({
              where: { identifier: `sign-in-otp-${SEEDED_USERS.fatima}` },
              orderBy: { createdAt: "desc" },
              take: 1,
            });
            return records[0]?.value ?? null;
          },
          { timeout: 10000 },
        )
        .not.toBeNull();

      const records = await prisma.verification.findMany({
        where: { identifier: `sign-in-otp-${SEEDED_USERS.fatima}` },
        orderBy: { createdAt: "desc" },
        take: 1,
      });
      // Stored value format: `${otp}:${failedAttempts}`
      const otp = records[0].value.split(":")[0];

      const inputs = page.locator('input[inputmode="numeric"]');
      for (let i = 0; i < otp.length; i++) {
        await inputs.nth(i).fill(otp[i]);
      }

      await page.waitForURL(/\/en\/dashboard/, { timeout: 15000 });
    });
  });

  test.describe("Signup Form", () => {
    test("should display signup form with all passwordless options", async ({ page }) => {
      await page.goto("/en/signup");

      await expect(page.locator("h1")).toContainText(/create your account/i);
      await expect(page.locator('input[id="name"]')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('button:has-text("GitHub")')).toBeVisible();
      await expect(page.locator('button:has-text("Google")')).toBeVisible();
      await expect(page.locator('input[id="terms"]')).toBeVisible();
      // No password fields
      await expect(page.locator('input[type="password"]')).toHaveCount(0);
      await expect(page.locator('input[id="confirmPassword"]')).toHaveCount(0);
    });

    test("should require terms acceptance for email path", async ({ page }) => {
      await page.goto("/en/signup");
      await page.fill('input[id="name"]', "Test User");
      await page.fill('input[type="email"]', "newuser-test@example.com");
      await page.click('button[type="submit"]');
      await expect(page.locator("text=/accept the terms/i")).toBeVisible();
    });

    test("should send a sign-in link when form is valid", async ({ page }) => {
      await page.goto("/en/signup");
      await page.fill('input[id="name"]', "Brand New User");
      await page.fill('input[type="email"]', "brand-new-test@example.com");
      await page.check('input[id="terms"]');
      await page.click('button[type="submit"]');
      await expect(page.locator("text=/check your inbox/i")).toBeVisible({
        timeout: 10000,
      });
    });

    test("should have link to login page", async ({ page }) => {
      await page.goto("/en/signup");
      const loginLink = page.locator('a:has-text("Sign In")');
      await expect(loginLink).toBeVisible();
      await expect(loginLink).toHaveAttribute("href", "/en/login");
    });
  });

  test.describe("OAuth Buttons", () => {
    test("login page has GitHub and Google buttons", async ({ page }) => {
      await page.goto("/en/login");
      await expect(page.locator('button:has-text("GitHub")')).toBeVisible();
      await expect(page.locator('button:has-text("Google")')).toBeVisible();
    });

    test("signup page has GitHub and Google buttons", async ({ page }) => {
      await page.goto("/en/signup");
      await expect(page.locator('button:has-text("GitHub")')).toBeVisible();
      await expect(page.locator('button:has-text("Google")')).toBeVisible();
    });
  });

  test.describe("Locale Switching", () => {
    test("should switch between English and Arabic", async ({ page }) => {
      await page.goto("/en/login");
      await expect(page.locator("h1")).toContainText(/welcome back/i);

      // Language switcher button toggles directly between locales
      await page.click('button[aria-label="Switch Language"]');

      await page.waitForURL(/\/ar\//);
      await expect(page.locator("h1")).toContainText(/مرحبًا/);
    });
  });
});
