import { test } from "@playwright/test";
import { expectValidationError } from "./helpers";

test.describe("API Validation - Public Endpoints", () => {
  test("GET /api/search rejects short query", async ({ request }) => {
    const response = await request.get("/api/search?q=a");
    await expectValidationError(response, "q");
  });

  test("GET /api/search rejects invalid status", async ({ request }) => {
    const response = await request.get("/api/search?q=prayer&status=invalid");
    await expectValidationError(response, "status");
  });

  test("GET /api/explore rejects out-of-range limit", async ({ request }) => {
    const response = await request.get("/api/explore?limit=999&page=1");
    await expectValidationError(response, "limit");
  });

  test("GET /api/projects rejects invalid status", async ({ request }) => {
    const response = await request.get("/api/projects?status=bad-status");
    await expectValidationError(response, "status");
  });

  test("GET /api/projects rejects invalid sortBy", async ({ request }) => {
    const response = await request.get("/api/projects?sortBy=ranked");
    await expectValidationError(response, "sortBy");
  });

  test("GET /api/skills rejects oversized query", async ({ request }) => {
    const longSearch = "a".repeat(130);
    const response = await request.get(`/api/skills?q=${longSearch}`);
    await expectValidationError(response, "q");
  });
});
