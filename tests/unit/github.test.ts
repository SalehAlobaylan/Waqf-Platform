import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizeGithubProfile, parseGithubData, fetchGithubPublicProfile } from "@/lib/github";
import { githubUsernameSchema, githubUpdateSchema } from "@/lib/validation/schemas";

function mockFetch(status: number, body: unknown) {
    const fetchMock = vi.fn(async () =>
        new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } })
    );
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("normalizeGithubProfile", () => {
    it("maps the GitHub payload to the card fields", () => {
        const profile = normalizeGithubProfile("octocat", {
            name: "Mona Lisa",
            avatar_url: "https://avatars.githubusercontent.com/u/1",
            bio: "The Octocat",
            followers: 1200,
            public_repos: 45,
        });

        expect(profile).toMatchObject({
            username: "octocat",
            name: "Mona Lisa",
            avatarUrl: "https://avatars.githubusercontent.com/u/1",
            bio: "The Octocat",
            followers: 1200,
            publicRepos: 45,
        });
        expect(profile.fetchedAt).toBeTruthy();
    });

    it("defaults missing optional fields", () => {
        const profile = normalizeGithubProfile("bare", { followers: 0, public_repos: 0 });
        expect(profile.name).toBeNull();
        expect(profile.avatarUrl).toBeNull();
        expect(profile.bio).toBeNull();
        expect(profile.followers).toBe(0);
    });
});

describe("fetchGithubPublicProfile", () => {
    it("returns and caches a successful response", async () => {
        const fetchMock = mockFetch(200, { name: "Mona", followers: 3, public_repos: 2 });

        const first = await fetchGithubPublicProfile("octocat");
        const second = await fetchGithubPublicProfile("octocat");

        expect(first.username).toBe("octocat");
        expect(second).toEqual(first);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("bypasses the cache when force is set", async () => {
        const fetchMock = mockFetch(200, { followers: 1, public_repos: 1 });

        await fetchGithubPublicProfile("forced-user");
        await fetchGithubPublicProfile("forced-user", { force: true });

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("maps 404 to a clean NOT_FOUND error", async () => {
        mockFetch(404, { message: "Not Found" });
        await expect(fetchGithubPublicProfile("no-such-user")).rejects.toMatchObject({
            status: 404,
            code: "NOT_FOUND",
        });
    });

    it("maps 429 and 403 to RATE_LIMITED errors", async () => {
        mockFetch(429, { message: "rate limited" });
        await expect(fetchGithubPublicProfile("rate-429")).rejects.toMatchObject({ status: 429, code: "RATE_LIMITED" });

        mockFetch(403, { message: "forbidden" });
        await expect(fetchGithubPublicProfile("rate-403")).rejects.toMatchObject({ status: 429, code: "RATE_LIMITED" });
    });

    it("maps unexpected statuses and network failures to 503", async () => {
        mockFetch(500, { message: "boom" });
        await expect(fetchGithubPublicProfile("srv-500")).rejects.toMatchObject({ status: 503 });

        vi.stubGlobal("fetch", vi.fn(async () => {
            throw new TypeError("network error");
        }));
        await expect(fetchGithubPublicProfile("srv-down")).rejects.toMatchObject({ status: 503, code: "SERVICE_UNAVAILABLE" });
    });
});

describe("parseGithubData", () => {
    it("round-trips a persisted profile", () => {
        const stored = {
            username: "octocat",
            name: "Mona",
            avatarUrl: "https://avatars.githubusercontent.com/u/1",
            bio: null,
            followers: 5,
            publicRepos: 2,
            fetchedAt: "2026-01-01T00:00:00.000Z",
        };
        expect(parseGithubData(stored)).toEqual(stored);
    });

    it("returns null for non-object and malformed shapes", () => {
        expect(parseGithubData(null)).toBeNull();
        expect(parseGithubData("octocat")).toBeNull();
        expect(parseGithubData({ followers: 5 })).toBeNull();
        expect(parseGithubData({ username: 42 })).toBeNull();
    });
});

describe("githubUsernameSchema", () => {
    it("accepts valid GitHub usernames", () => {
        for (const valid of ["octocat", "a", "abc-123", "A-B-C", "x".repeat(39)]) {
            expect(githubUsernameSchema.safeParse(valid).success).toBe(true);
        }
    });

    it("trims surrounding whitespace", () => {
        const result = githubUsernameSchema.safeParse("  octocat  ");
        expect(result.success).toBe(true);
        if (result.success) expect(result.data).toBe("octocat");
    });

    it("rejects invalid usernames", () => {
        for (const invalid of ["", "   ", "-leading", "trailing-", "under_score", "has space", "a".repeat(40)]) {
            expect(githubUsernameSchema.safeParse(invalid).success).toBe(false);
        }
    });
});

describe("githubUpdateSchema", () => {
    it("requires a username and makes force optional", () => {
        expect(githubUpdateSchema.safeParse({}).success).toBe(false);
        expect(githubUpdateSchema.safeParse({ username: "octocat" }).success).toBe(true);
        expect(githubUpdateSchema.safeParse({ username: "octocat", force: true }).success).toBe(true);
    });
});