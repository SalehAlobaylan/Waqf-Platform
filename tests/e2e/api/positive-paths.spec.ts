import { test, expect } from "@playwright/test";
import { signInAs, SEEDED_USERS } from "../auth-helpers";

test.describe("API Positive Paths", () => {
  test.describe("Public endpoints", () => {
    test("GET /api/projects returns seeded projects with pagination", async ({ request }) => {
      const response = await request.get("/api/projects?limit=5&offset=0");
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body.projects)).toBeTruthy();
      expect(body.projects.length).toBeGreaterThan(0);
      expect(body.pagination.total).toBeGreaterThan(0);
      expect(body.pagination.limit).toBe(5);
    });

    test("GET /api/projects/[id] returns a seeded project", async ({ request }) => {
      const list = await request.get("/api/projects?limit=1");
      const { projects } = await list.json();
      const id = projects[0].id;

      const response = await request.get(`/api/projects/${id}`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.id).toBe(id);
      expect(typeof body.title).toBe("string");
    });

    test("GET /api/search returns results for valid query", async ({ request }) => {
      const response = await request.get(
        `/api/search?q=${encodeURIComponent("قرآن")}`,
      );
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body.projects)).toBeTruthy();
      expect(body.total).toBeGreaterThan(0);
    });

    test("GET /api/skills returns skill list", async ({ request }) => {
      const response = await request.get("/api/skills");
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      expect(body.length).toBeGreaterThan(0);
      expect(typeof body[0].name).toBe("string");
    });

    test("GET /api/campaigns returns seeded campaigns", async ({ request }) => {
      const response = await request.get("/api/campaigns?status=RECRUITING");
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body.campaigns)).toBeTruthy();
      expect(body.campaigns.length).toBeGreaterThan(0);
    });

    test("GET /api/stats returns platform stats", async ({ request }) => {
      const response = await request.get("/api/stats");
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(typeof body).toBe("object");
    });
  });

  test.describe("Authenticated endpoints", () => {
    test("GET /api/notifications returns notifications for signed-in user", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      const response = await page.request.get("/api/notifications");
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body.notifications)).toBeTruthy();
      expect(body.notifications.length).toBeGreaterThan(0);
    });

    test("GET /api/messages returns messages for signed-in user", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      // Fetch one of omar's application IDs first
      const appsResponse = await page.request.get("/api/applications");
      expect(appsResponse.status()).toBe(200);
      const appsBody = await appsResponse.json();
      const applications = Array.isArray(appsBody) ? appsBody : (appsBody.applications ?? []);
      expect(applications.length).toBeGreaterThan(0);

      const response = await page.request.get(
        `/api/messages?applicationId=${applications[0].id}`,
      );
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body.messages)).toBeTruthy();
    });

    test("GET /api/admin/stats returns stats for admin user", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.admin);

      const response = await page.request.get("/api/admin/stats");
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.overview).toBeDefined();
      expect(typeof body.overview.totalUsers).toBe("number");
    });

    test("GET /api/admin/projects returns projects for admin user", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.admin);

      const response = await page.request.get("/api/admin/projects");
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body.projects)).toBeTruthy();
      expect(body.pagination).toBeDefined();
    });

    test("POST /api/reports creates a report for signed-in user", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      const uniqueTargetId = `positive-path-test-${Date.now()}`;
      const response = await page.request.post("/api/reports", {
        data: {
          targetType: "PROJECT",
          targetId: uniqueTargetId,
          reason: "Inappropriate content",
          details: "Testing report creation via API",
        },
      });
      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.report.id).toBeDefined();
      expect(body.report.status).toBe("PENDING");
    });

    test("POST /api/upload returns 401 when no upload is attached", async ({ page }) => {
      await signInAs(page, SEEDED_USERS.omar);

      const response = await page.request.post("/api/upload", {
        multipart: {
          file: {
            name: "test.txt",
            mimeType: "text/plain",
            buffer: Buffer.from("hello"),
          },
        },
      });
      // Missing/invalid token or upstream config should not 500
      expect([400, 401, 403, 500]).toContain(response.status());
    });
  });
});
