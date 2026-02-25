import { test as base, Page } from "@playwright/test";

export type TestUser = {
  id: string;
  email: string;
  password: string;
  name: string;
};

export const testUsers: TestUser[] = [
  {
    id: "test-owner-1",
    email: "owner@test.com",
    password: "TestPass123",
    name: "Test Owner",
  },
  {
    id: "test-contributor-1",
    email: "contributor@test.com",
    password: "TestPass123",
    name: "Test Contributor",
  },
  {
    id: "test-admin-1",
    email: "admin@test.com",
    password: "TestPass123",
    name: "Test Admin",
  },
];

export const testUser = testUsers[0];
export const contributorUser = testUsers[1];
export const adminUser = testUsers[2];

export const test = base.extend<{
  testUser: TestUser;
  contributorUser: TestUser;
  adminUser: TestUser;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}>({
  testUser: async ({}, use) => {
    await use(testUsers[0]);
  },
  contributorUser: async ({}, use) => {
    await use(testUsers[1]);
  },
  adminUser: async ({}, use) => {
    await use(testUsers[2]);
  },
  login: async ({ page }, use) => {
    await use(async (email: string, password: string) => {
      await page.goto("/en/login");
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForURL("/en/dashboard", { timeout: 10000 });
    });
  },
  logout: async ({ page }, use) => {
    await use(async () => {
      await page.click("button:has-text('Test Owner'), button:has-text('Test Contributor')");
      await page.click("button:has-text('logout'), button:has-text('Logout')");
      await page.waitForURL("/en", { timeout: 10000 });
    });
  },
});
