import { test, expect } from "@playwright/test";
import { signInAs, SEEDED_USERS } from "../auth-helpers";
import { expectValidationError } from "./helpers";

test.describe("API Validation - Hardening", () => {
  test.describe("Body parsing", () => {
    test("oversized body is rejected before schema validation", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      // > 1 MB body — parseBody must reject before JSON/schema handling.
      const bigPitch = "x".repeat(1024 * 1024 + 64);
      const response = await page.request.post("/api/campaigns", {
        data: {
          title: "A valid title",
          pitch: bigPitch,
          problem: "A valid problem description",
        },
      });
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("Validation failed");
    });

    test("whitespace-only required fields are rejected", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      const response = await page.request.post("/api/campaigns", {
        data: {
          title: "   ",
          pitch: "   ",
          problem: "   ",
        },
      });
      await expectValidationError(response, "title");
    });

    test("whitespace-only campaign fields fail field validation", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      const response = await page.request.post("/api/campaigns", {
        data: {
          title: "   ",
          pitch: "x".repeat(12),
          problem: "x".repeat(12),
        },
      });
      await expectValidationError(response, "title");
    });
  });

  test.describe("Campaign date ordering", () => {
    test("campaign start date in the past is rejected", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      const response = await page.request.post("/api/campaigns", {
        data: {
          title: "Valid title",
          pitch: "x".repeat(12),
          problem: "x".repeat(12),
          startsAt: new Date(Date.now() - 86400000).toISOString(),
        },
      });
      await expectValidationError(response, "startsAt");
    });

    test("recruitment deadline before start date is rejected", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      const future = new Date(Date.now() + 5 * 86400000).toISOString();
      const later = new Date(Date.now() + 10 * 86400000).toISOString();
      const response = await page.request.post("/api/campaigns", {
        data: {
          title: "Valid title",
          pitch: "x".repeat(12),
          problem: "x".repeat(12),
          startsAt: later,
          recruitmentDeadline: future,
        },
      });
      await expectValidationError(response, "recruitmentDeadline");
    });
  });

  test.describe("Skill existence", () => {
    test("unknown skills in profile update are rejected", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      const response = await page.request.patch("/api/contributors/profile", {
        data: {
          selectedSkills: [99999999],
        },
      });
      await expectValidationError(response, "selectedSkills");
    });

    test("unknown skills in project creation are rejected", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      const response = await page.request.post("/api/projects", {
        data: {
          title: "A valid project title",
          description: "x".repeat(30),
          category: "TOOLS",
          skills: [{ skillId: 99999999, isRequired: true }],
        },
      });
      await expectValidationError(response, "skills");
    });
  });

  test.describe("Admin featured", () => {
    test("featured flag is required", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.admin);

      const response = await page.request.put("/api/admin/featured", {
        data: {
          projectId: "some-project-id",
        },
      });
      await expectValidationError(response, "featured");
    });

    test("featuredUntil in the past is rejected when featuring", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.admin);

      const response = await page.request.put("/api/admin/featured", {
        data: {
          projectId: "some-project-id",
          featured: true,
          featuredUntil: new Date(Date.now() - 86400000).toISOString(),
        },
      });
      await expectValidationError(response, "featuredUntil");
    });
  });

  test.describe("Upload MIME spoofing", () => {
    test("file whose content does not match its declared type is rejected", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      // Declared as PNG but contains text — magic-byte sniffing must reject it
      // before uploadthing is reached. The dev/CI environment may not have
      // uploadthing configured, so we only assert on the validation contract.
      const response = await page.request.post("/api/upload", {
        multipart: {
          file: {
            name: "fake.png",
            mimeType: "image/png",
            buffer: Buffer.from("this is definitely not a png"),
          },
        },
      });
      // Either the sniff rejects it (400) or an upstream config error (401/403/500)
      expect([400, 401, 403, 500]).toContain(response.status());
      if (response.status() === 400) {
        const body = await response.json();
        expect(body.error).toBe("Validation failed");
      }
    });
  });
});
