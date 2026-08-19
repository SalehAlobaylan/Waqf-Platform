import { test, expect } from "@playwright/test";
import { signInAs, SEEDED_USERS } from "../auth-helpers";
import { expectUnauthorizedError } from "./helpers";

test.describe("Contributor GitHub", () => {
  test("unauthenticated GET is rejected", async ({ page }) => {
    const response = await page.request.get("/api/contributors/github");
    await expectUnauthorizedError(response);
  });

  test("unauthenticated PATCH is rejected", async ({ page }) => {
    const response = await page.request.patch("/api/contributors/github", {
      data: { username: "octocat" },
    });
    await expectUnauthorizedError(response);
  });

  test("a signed-in user can read their (empty) GitHub connection", async ({ page }) => {
    await signInAs(page, SEEDED_USERS.omar);
    const response = await page.request.get("/api/contributors/github");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.profile.username).toBeNull();
    expect(body.profile.synced).toBe(false);
  });

  test("invalid usernames are rejected with 400 before any GitHub call", async ({ page }) => {
    await signInAs(page, SEEDED_USERS.omar);
    for (const username of ["", "   ", "-leading", "has space", "under_score", "a".repeat(40)]) {
      const response = await page.request.patch("/api/contributors/github", {
        data: { username },
      });
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.code).toBe("VALIDATION_FAILED");
    }
  });
});