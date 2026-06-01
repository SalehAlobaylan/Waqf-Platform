import { APIResponse, expect } from "@playwright/test";

type ValidationDetails = {
  path: string;
  message: string;
};

type ValidationErrorBody = {
  error: string;
  details: ValidationDetails[];
};

export async function expectValidationError(response: APIResponse, expectedPath?: string) {
  expect(response.status()).toBe(400);

  const body = (await response.json()) as ValidationErrorBody;
  expect(body.error).toBe("Validation failed");
  expect(Array.isArray(body.details)).toBeTruthy();
  expect(body.details.length).toBeGreaterThan(0);

  if (expectedPath) {
    expect(body.details.some((detail) => detail.path === expectedPath)).toBeTruthy();
  }
}

export async function expectUnauthorizedError(response: APIResponse) {
  expect(response.status()).toBe(401);
  const body = (await response.json()) as { error?: string };
  expect(typeof body.error).toBe("string");
  expect(body.error).not.toBe("Validation failed");
}

export async function expectForbiddenError(response: APIResponse) {
  expect(response.status()).toBe(403);
  const body = (await response.json()) as { error?: string };
  expect(typeof body.error).toBe("string");
  expect(body.error).not.toBe("Validation failed");
}

export async function expectUnauthorizedOrForbidden(response: APIResponse) {
  expect([401, 403]).toContain(response.status());
  const body = (await response.json()) as { error?: string };
  expect(typeof body.error).toBe("string");
  expect(body.error).not.toBe("Validation failed");
}
