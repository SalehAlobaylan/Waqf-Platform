import { test } from "@playwright/test";
import { expectUnauthorizedError, expectValidationError } from "./helpers";

test.describe("API Validation - Dynamic Params", () => {
  const longId = "a".repeat(129);

  test("GET /api/projects/[id] rejects too-long id", async ({ request }) => {
    const response = await request.get(`/api/projects/${longId}`);
    await expectValidationError(response, "id");
  });

  test("GET /api/projects/[id]/similar rejects too-long id", async ({ request }) => {
    const response = await request.get(`/api/projects/${longId}/similar`);
    await expectValidationError(response, "id");
  });

  test("POST /api/projects/[id]/view rejects too-long id", async ({ request }) => {
    const response = await request.post(`/api/projects/${longId}/view`);
    await expectValidationError(response, "id");
  });

  test("GET /api/contributors/[id] rejects whitespace id", async ({ request }) => {
    const response = await request.get("/api/contributors/%20");
    await expectValidationError(response, "id");
  });

  test("PATCH /api/messages/[id]/read keeps auth precedence", async ({ request }) => {
    const response = await request.patch(`/api/messages/${longId}/read`);
    await expectUnauthorizedError(response);
  });

  test("DELETE /api/applications/[id] keeps auth precedence", async ({ request }) => {
    const response = await request.delete(`/api/applications/${longId}`);
    await expectUnauthorizedError(response);
  });
});
