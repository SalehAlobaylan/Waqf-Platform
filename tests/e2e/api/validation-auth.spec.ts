import { test } from "@playwright/test";
import { expectForbiddenError, expectUnauthorizedError, expectValidationError } from "./helpers";

test.describe("API Validation - Auth Guardrails", () => {
  test("POST /api/applications preserves 401 precedence", async ({ request }) => {
    const response = await request.post("/api/applications", {
      data: {
        projectId: "",
        hoursPerWeek: 200,
      },
    });
    await expectUnauthorizedError(response);
  });

  test("PATCH /api/notifications preserves 401 precedence", async ({ request }) => {
    const response = await request.patch("/api/notifications", {
      data: {
        notificationIds: [],
        markAllRead: false,
      },
    });
    await expectUnauthorizedError(response);
  });

  test("POST /api/reports preserves 401 precedence", async ({ request }) => {
    const response = await request.post("/api/reports", {
      data: {
        targetType: "UNKNOWN",
        targetId: "",
        reason: "x",
      },
    });
    await expectUnauthorizedError(response);
  });

  test("GET /api/messages preserves 401 precedence", async ({ request }) => {
    const response = await request.get("/api/messages");
    await expectUnauthorizedError(response);
  });

  test("GET /api/reports preserves 403 precedence", async ({ request }) => {
    const response = await request.get("/api/reports?status=BAD");
    await expectForbiddenError(response);
  });

  test("schema contract helper works on known public validation", async ({ request }) => {
    const response = await request.get("/api/search?q=a");
    await expectValidationError(response, "q");
  });
});
