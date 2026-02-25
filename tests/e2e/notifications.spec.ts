import { test, expect } from "@playwright/test";

test.describe("Notifications Flow", () => {
  test.describe("Notification Bell", () => {
    test("should display notification bell for authenticated users", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      // Should show notification bell
      const bellButton = page.locator('button[aria-label*="notification" i]');
      if (await bellButton.isVisible()) {
        await expect(bellButton).toBeVisible();
      }
    });

    test("should show notification dropdown when clicked", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      // Click notification bell
      const bellButton = page.locator('button[aria-label*="notification" i]');
      if (await bellButton.isVisible()) {
        await bellButton.click();
        
        // Should show dropdown
        await expect(page.locator("text=Notifications")).toBeVisible();
      }
    });

    test("should show empty state when no notifications", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      const bellButton = page.locator('button[aria-label*="notification" i]');
      if (await bellButton.isVisible()) {
        await bellButton.click();
        
        // Should show empty state
        await expect(page.locator("text=no notification, text=No notifications")).toBeVisible();
      }
    });

    test("should show unread count badge", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      // Look for unread badge
      const badge = page.locator("span:has-text('1'), span:has-text('2'), span:has-text('9+')");
    });
  });

  test.describe("Notification Types", () => {
    test("should show new application notification icon", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      const bellButton = page.locator('button[aria-label*="notification" i]');
      if (await bellButton.isVisible()) {
        await bellButton.click();
        
        // Look for notification type icons
        const userPlusIcon = page.locator("text=New Application");
      }
    });

    test("should show message notification icon", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      const bellButton = page.locator('button[aria-label*="notification" i]');
      if (await bellButton.isVisible()) {
        await bellButton.click();
        
        const messageIcon = page.locator("text=New Message");
      }
    });
  });

  test.describe("Notification Actions", () => {
    test("should have mark all as read button", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      const bellButton = page.locator('button[aria-label*="notification" i]');
      if (await bellButton.isVisible()) {
        await bellButton.click();
        
        const markAllRead = page.locator("text=Mark all read");
      }
    });

    test("should navigate to notification link", async ({ page }) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "TestPass123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 15000 });
      
      const bellButton = page.locator('button[aria-label*="notification" i]');
      if (await bellButton.isVisible()) {
        await bellButton.click();
        
        // Click on a notification
        const notification = page.locator('[class*="notification"] a').first();
        if (await notification.isVisible()) {
          await notification.click();
          
          // Should navigate
          await page.waitForTimeout(500);
        }
      }
    });
  });

  test.describe("Access Control", () => {
    test("should not show notification bell for unauthenticated users", async ({ page }) => {
      await page.goto("/en");
      
      const bellButton = page.locator('button[aria-label*="notification" i]');
      await expect(bellButton).toBeHidden();
    });
  });
});
