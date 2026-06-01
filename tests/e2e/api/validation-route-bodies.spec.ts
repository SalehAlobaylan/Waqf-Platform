import { test } from "@playwright/test";
import { expectUnauthorizedError, expectUnauthorizedOrForbidden } from "./helpers";

test.describe("API Validation - Route Body Contracts", () => {
  const longId = "x".repeat(129);

  test("PUT /api/projects/[id] rejects empty body shape when authenticated path is bypassed", async ({ request }) => {
    const response = await request.put(`/api/projects/${longId}`, {
      data: {},
    });
    await expectUnauthorizedError(response);
  });

  test("PATCH /api/projects/[id]/status keeps auth precedence", async ({ request }) => {
    const response = await request.patch(`/api/projects/${longId}/status`, {
      data: {
        status: "INVALID",
      },
    });
    await expectUnauthorizedError(response);
  });

  test("PATCH /api/reports/[id] keeps role/auth precedence", async ({ request }) => {
    const response = await request.patch(`/api/reports/${longId}`, {
      data: {
        status: "BAD",
      },
    });
    await expectUnauthorizedOrForbidden(response);
  });
});
