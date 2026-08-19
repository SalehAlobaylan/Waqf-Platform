import { AppError } from "@/lib/api/errors";

/** Public data exposed by the contributor's GitHub card, persisted as githubData. */
export interface GithubPublicProfile {
    username: string;
    name: string | null;
    avatarUrl: string | null;
    bio: string | null;
    followers: number;
    publicRepos: number;
    fetchedAt: string;
}

const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;
const cache = new Map<string, { data: GithubPublicProfile; expiresAt: number }>();

function pruneCache(): void {
    if (cache.size < MAX_CACHE_ENTRIES) return;
    const now = Date.now();
    for (const [key, entry] of cache) {
        if (entry.expiresAt <= now) cache.delete(key);
    }
}

/**
 * Maps the unauthenticated GitHub `/users/{username}` payload to the fields the
 * card shows. Separated from the network call so it is unit-testable.
 */
export function normalizeGithubProfile(username: string, raw: Record<string, unknown>): GithubPublicProfile {
    return {
        username,
        name: typeof raw.name === "string" ? raw.name : null,
        avatarUrl: typeof raw.avatar_url === "string" ? raw.avatar_url : null,
        bio: typeof raw.bio === "string" && raw.bio.length > 0 ? raw.bio : null,
        followers: typeof raw.followers === "number" ? raw.followers : 0,
        publicRepos: typeof raw.public_repos === "number" ? raw.public_repos : 0,
        fetchedAt: new Date().toISOString(),
    };
}

function isRateLimited(status: number): boolean {
    return status === 403 || status === 429;
}

/**
 * Validates a githubData payload read back from the database. `githubData` is
 * a Prisma Json column written by fetchGithubPublicProfile; this guard keeps
 * the UI safe from unexpected shapes without throwing.
 */
export function parseGithubData(value: unknown): GithubPublicProfile | null {
    if (!value || typeof value !== "object") return null;
    const raw = value as Record<string, unknown>;
    if (typeof raw.username !== "string" || raw.username.length === 0) return null;
    return {
        username: raw.username,
        name: typeof raw.name === "string" ? raw.name : null,
        avatarUrl: typeof raw.avatarUrl === "string" ? raw.avatarUrl : null,
        bio: typeof raw.bio === "string" ? raw.bio : null,
        followers: typeof raw.followers === "number" ? raw.followers : 0,
        publicRepos: typeof raw.publicRepos === "number" ? raw.publicRepos : 0,
        fetchedAt: typeof raw.fetchedAt === "string" ? raw.fetchedAt : "",
    };
}

/**
 * Fetches a GitHub user's public profile over the unauthenticated REST API,
 * short-caching the result in-process. Throws `AppError`s mapped to the app's
 * error contract so `withApiHandler` renders a clean response.
 *
 * The unauthenticated API is limited to 60 requests/hour/IP, so callers must
 * use `checkRateLimit` and the cache before hitting it with `force`.
 */
export async function fetchGithubPublicProfile(
    username: string,
    options: { force?: boolean } = {}
): Promise<GithubPublicProfile> {
    const cacheKey = username.toLowerCase();
    const cached = cache.get(cacheKey);
    if (!options.force && cached && cached.expiresAt > Date.now()) {
        return cached.data;
    }

    let res: Response;
    try {
        res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
            headers: {
                "User-Agent": "waqf-platform",
                Accept: "application/vnd.github+json",
            },
            signal: AbortSignal.timeout(8000),
        });
    } catch {
        throw new AppError({
            status: 503,
            code: "SERVICE_UNAVAILABLE",
            message: "GitHub is temporarily unreachable",
        });
    }

    if (res.status === 404) {
        throw new AppError({
            status: 404,
            code: "NOT_FOUND",
            message: `GitHub user '${username}' does not exist`,
            details: [{ path: "username", message: "No GitHub account found with this username" }],
        });
    }

    if (isRateLimited(res.status)) {
        throw new AppError({
            status: 429,
            code: "RATE_LIMITED",
            message: "GitHub API rate limit reached, please try again later",
        });
    }

    if (!res.ok) {
        throw new AppError({
            status: 503,
            code: "SERVICE_UNAVAILABLE",
            message: "GitHub returned an unexpected response",
        });
    }

    const data = normalizeGithubProfile(username, (await res.json()) as Record<string, unknown>);
    cache.set(cacheKey, { data, expiresAt: Date.now() + CACHE_TTL_MS });
    pruneCache();
    return data;
}