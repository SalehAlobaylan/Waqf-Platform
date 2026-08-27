/**
 * Generic GitHub repository metadata layer.
 *
 * Waqf consumes **public metadata** about any project that links a GitHub
 * repository, not its runtime. This keeps Waqf independently buildable:
 * if the Toolkit (or any future showcase) goes down or publishes a new
 * release, Waqf still functions — only the contribution section degrades
 * gracefully to `null`.
 *
 * This module is intentionally generic: no `if (slug === "islamic-toolkit")`
 * branching. Any Project with a `githubUrl` / `websiteUrl` + `isOpenSource`
 * can use it. Toolkit is simply the first consumer.
 */

const REPO_CACHE_TTL_MS = 10 * 60 * 1000;
const ISSUE_CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;

export interface ParsedRepo {
    owner: string;
    repo: string;
}

export interface GitHubRepoInfo {
    owner: string;
    repo: string;
    fullName: string;
    htmlUrl: string;
    description: string | null;
    stars: number;
    forks: number;
    openIssues: number;
    language: string | null;
    license: string | null;
    updatedAt: string;
    fetchedAt: string;
}

export interface GitHubIssue {
    number: number;
    title: string;
    htmlUrl: string;
    labels: Array<{ name: string; color: string }>;
    state: string;
    createdAt: string;
    comments: number;
}

const repoCache = new Map<string, { data: GitHubRepoInfo; expiresAt: number }>();
const issueCache = new Map<string, { data: GitHubIssue[]; expiresAt: number }>();

function pruneCache<K, V extends { expiresAt: number }>(cache: Map<K, V>) {
    if (cache.size < MAX_CACHE_ENTRIES) return;
    const now = Date.now();
    for (const [key, entry] of cache) {
        if (entry.expiresAt <= now) cache.delete(key);
    }
    // If still large, drop oldest
    if (cache.size >= MAX_CACHE_ENTRIES) {
        const firstKey = cache.keys().next().value as K | undefined;
        if (firstKey) cache.delete(firstKey);
    }
}

function githubHeaders(): HeadersInit {
    const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
        "User-Agent": "waqf-platform",
        "X-GitHub-Api-Version": "2022-11-28",
    };
    // Optional: higher rate-limit when configured (not required for public data)
    const token = process.env.GITHUB_TOKEN ?? process.env.GITHUB_CLIENT_SECRET;
    if (token && token.length > 10) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
}

/**
 * Parses a GitHub repository URL into owner/repo.
 * Handles:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo/
 * - https://github.com/owner/repo.git
 * - http://github.com/owner/repo
 * - github.com/owner/repo
 * Returns null for non-GitHub URLs.
 */
export function parseGitHubRepoUrl(url: string | null | undefined): ParsedRepo | null {
    if (!url || typeof url !== "string") return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    try {
        // Normalize bare domains like github.com/owner/repo
        const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
        const parsed = new URL(normalized);
        if (parsed.hostname.toLowerCase() !== "github.com") return null;
        const parts = parsed.pathname.split("/").filter(Boolean);
        if (parts.length < 2) return null;
        const owner = parts[0];
        let repo = parts[1];
        // Strip .git suffix
        if (repo.endsWith(".git")) repo = repo.slice(0, -4);
        if (!owner || !repo) return null;
        // Validate (GitHub allows alphanumeric, hyphens, dots, underscores)
        if (!/^[\w.-]+$/.test(owner) || !/^[\w.-]+$/.test(repo)) return null;
        return { owner, repo };
    } catch {
        return null;
    }
}

export function getRepoKey(owner: string, repo: string): string {
    return `${owner.toLowerCase()}/${repo.toLowerCase()}`;
}

function normalizeRepo(owner: string, repo: string, raw: Record<string, unknown>): GitHubRepoInfo {
    return {
        owner,
        repo,
        fullName: typeof raw.full_name === "string" ? raw.full_name : `${owner}/${repo}`,
        htmlUrl: typeof raw.html_url === "string" ? raw.html_url : `https://github.com/${owner}/${repo}`,
        description: typeof raw.description === "string" ? raw.description : null,
        stars: typeof raw.stargazers_count === "number" ? raw.stargazers_count : 0,
        forks: typeof raw.forks_count === "number" ? raw.forks_count : 0,
        openIssues: typeof raw.open_issues_count === "number" ? raw.open_issues_count : 0,
        language: typeof raw.language === "string" ? raw.language : null,
        license:
            raw.license && typeof raw.license === "object" && raw.license !== null && "spdx_id" in (raw.license as Record<string, unknown>)
                ? String((raw.license as Record<string, unknown>).spdx_id) !== "NOASSERTION"
                    ? String((raw.license as Record<string, unknown>).spdx_id)
                    : null
                : null,
        updatedAt: typeof raw.updated_at === "string" ? raw.updated_at : new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
    };
}

function normalizeIssue(raw: Record<string, unknown>): GitHubIssue | null {
    if (typeof raw.number !== "number" || typeof raw.title !== "string") return null;
    const labels: Array<{ name: string; color: string }> = [];
    if (Array.isArray(raw.labels)) {
        for (const l of raw.labels) {
            if (l && typeof l === "object" && "name" in (l as Record<string, unknown>)) {
                const name = (l as Record<string, unknown>).name;
                const color = (l as Record<string, unknown>).color;
                if (typeof name === "string") {
                    labels.push({
                        name,
                        color: typeof color === "string" ? color : "ededed",
                    });
                }
            }
        }
    }
    return {
        number: raw.number,
        title: raw.title,
        htmlUrl: typeof raw.html_url === "string" ? raw.html_url : "",
        labels,
        state: typeof raw.state === "string" ? raw.state : "open",
        createdAt: typeof raw.created_at === "string" ? raw.created_at : new Date().toISOString(),
        comments: typeof raw.comments === "number" ? raw.comments : 0,
    };
}

/**
 * Fetches public repository metadata. On failure (rate-limit, 404, network)
 * returns `null` so callers can degrade gracefully — Waqf must never break
 * if a downstream repo or deployment is unavailable.
 */
export async function fetchGitHubRepoInfo(
    owner: string,
    repo: string,
    options: { force?: boolean } = {}
): Promise<GitHubRepoInfo | null> {
    const key = getRepoKey(owner, repo);
    const cached = repoCache.get(key);
    if (!options.force && cached && cached.expiresAt > Date.now()) {
        return cached.data;
    }
    let res: Response;
    try {
        res = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {
            headers: githubHeaders(),
            signal: AbortSignal.timeout(8000),
            // Next.js fetch cache hint — revalidate in background, don't block
            next: { revalidate: 600 },
        } as RequestInit);
    } catch {
        return null;
    }
    if (!res.ok) return null;
    try {
        const json = (await res.json()) as Record<string, unknown>;
        const data = normalizeRepo(owner, repo, json);
        repoCache.set(key, { data, expiresAt: Date.now() + REPO_CACHE_TTL_MS });
        pruneCache(repoCache);
        return data;
    } catch {
        return null;
    }
}

/**
 * Fetches open issues for a repo, sorted by creation desc.
 * Returns null on failure (graceful degradation).
 */
export async function fetchGitHubIssues(
    owner: string,
    repo: string,
    options: { perPage?: number; force?: boolean } = {}
): Promise<GitHubIssue[] | null> {
    const perPage = Math.min(Math.max(options.perPage ?? 8, 1), 30);
    const key = `${getRepoKey(owner, repo)}:issues:${perPage}`;
    const cached = issueCache.get(key);
    if (!options.force && cached && cached.expiresAt > Date.now()) {
        return cached.data;
    }
    let res: Response;
    try {
        const params = new URLSearchParams({
            state: "open",
            sort: "created",
            direction: "desc",
            per_page: String(perPage),
        });
        res = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues?${params.toString()}`, {
            headers: githubHeaders(),
            signal: AbortSignal.timeout(8000),
            next: { revalidate: 300 },
        } as RequestInit);
    } catch {
        return null;
    }
    if (!res.ok) return null;
    try {
        const json = (await res.json()) as unknown;
        if (!Array.isArray(json)) return null;
        // GitHub issues API includes pull requests — filter them out (PRs have `pull_request` field)
        const issues: GitHubIssue[] = [];
        for (const item of json) {
            if (!item || typeof item !== "object") continue;
            const raw = item as Record<string, unknown>;
            if ("pull_request" in raw) continue;
            const norm = normalizeIssue(raw);
            if (norm) issues.push(norm);
        }
        issueCache.set(key, { data: issues, expiresAt: Date.now() + ISSUE_CACHE_TTL_MS });
        pruneCache(issueCache);
        return issues;
    } catch {
        return null;
    }
}

/** Convenience: derive repo info directly from a project URL string */
export async function fetchRepoInfoFromUrl(githubUrl: string | null | undefined): Promise<GitHubRepoInfo | null> {
    const parsed = parseGitHubRepoUrl(githubUrl);
    if (!parsed) return null;
    return fetchGitHubRepoInfo(parsed.owner, parsed.repo);
}

export async function fetchIssuesFromUrl(
    githubUrl: string | null | undefined,
    perPage = 6
): Promise<GitHubIssue[] | null> {
    const parsed = parseGitHubRepoUrl(githubUrl);
    if (!parsed) return null;
    return fetchGitHubIssues(parsed.owner, parsed.repo, { perPage });
}

/** For testing/cache invalidation */
export function __clearRepoCache(): void {
    repoCache.clear();
    issueCache.clear();
}
