import { test, expect } from "@playwright/test";
import { signInAs, SEEDED_USERS } from "../auth-helpers";
import { expectUnauthorizedError, expectForbiddenError } from "./helpers";

test.describe("Admin System Logs", () => {
  test("unauthenticated GET is rejected", async ({ page }) => {
    const response = await page.request.get("/api/admin/system-logs");
    await expectUnauthorizedError(response);
  });

  test("non-admin GET is forbidden", async ({ page }) => {
    await signInAs(page, SEEDED_USERS.omar);
    const response = await page.request.get("/api/admin/system-logs");
    await expectForbiddenError(response);
  });

  test("admin GET returns the empty list contract", async ({ page }) => {
    await signInAs(page, SEEDED_USERS.admin);
    const response = await page.request.get("/api/admin/system-logs");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body.logs)).toBeTruthy();
    expect(typeof body.total).toBe("number");
    expect(body.page).toBe(1);
    expect(body.pages).toBeGreaterThanOrEqual(1);
  });

  test("admin can clear old logs", async ({ page }) => {
    await signInAs(page, SEEDED_USERS.admin);
    const response = await page.request.delete("/api/admin/system-logs?olderThanDays=30");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(typeof body.deleted).toBe("number");
  });
});