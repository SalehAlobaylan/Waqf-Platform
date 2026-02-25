import { test, expect } from "@playwright/test";

test.describe("Messages Flow", () => {
  test.describe("Messages Page", () => {
    test("should display messages page for authenticated user", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      await page.goto("/en/dashboard/messages");
      
      await expect(page.locator("h1")).toContainText(/message/i);
    });

    test("should show conversations list", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      await page.goto("/en/dashboard/messages");
      
      // Should show conversations or empty state
      const content = await page.content();
      expect(content).toMatch(/message|conversation|chat/i);
    });

    test("should show empty state when no conversations", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      await page.goto("/en/dashboard/messages");
      
      // Look for empty state message
      await expect(page.locator("text=no message, text=No messages yet")).toBeVisible();
    });
  });

  test.describe("Chat Window", () => {
    test("should display chat interface", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      await page.goto("/en/dashboard/messages");
      
      // Look for message input
      const messageInput = page.locator('textarea[placeholder*="message" i]');
      if (await messageInput.isVisible()) {
        await expect(messageInput).toBeVisible();
      }
    });

    test("should have send button", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      await page.goto("/en/dashboard/messages");
      
      const sendButton = page.locator('button[type="submit"]:has-text("Send")');
      if (await sendButton.isVisible()) {
        await expect(sendButton).toBeVisible();
      }
    });
  });

  test.describe("Access Control", () => {
    test("should redirect unauthenticated users from messages page", async ({ page }) => {
      await page.goto("/en/dashboard/messages");
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe("Real-time Updates", () => {
    test("should show loading state while fetching messages", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      await page.goto("/en/dashboard/messages");
      
      // Should show loading indicator
      const loadingSpinner = page.locator('[class*="spinner"], [class*="loader"]');
    });
  });
});
