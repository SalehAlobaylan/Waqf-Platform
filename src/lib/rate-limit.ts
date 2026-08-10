import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logger";

export interface RateLimitOptions {
    limit: number;
    windowMs: number;
}

export interface RateLimitResult {
    allowed: boolean;
    /** Seconds until the window resets. 0 when the request is allowed. */
    retryAfterSeconds: number;
}

interface Bucket {
    count: number;
    resetAt: number;
}

// In-memory sliding window per (scope, ip, suffix). Note: this is
// per-instance state — correct for a single-instance deployment. Before
// scaling horizontally, replace with a shared store (e.g. Upstash/Redis) by
// swapping the Map for a Lua-backed INCR+EXPIRE implementation.
const buckets = new Map<string, Bucket>();

const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    for (const [key, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(key);
    }
}

/**
 * Client IP for rate-limit bucketing. `x-real-ip` is preferred because it is
 * set by the reverse proxy and cannot be spoofed by the caller; `x-forwarded-for`
 * is only trusted as a fallback.
 */
function getClientIp(request: NextRequest): string {
    const realIp = request.headers.get("x-real-ip");
    if (realIp) return realIp;
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    return "unknown";
}

/**
 * Fixed-window rate limiter. Returns the result of consuming one unit from
 * the bucket for `scope` + client IP (+ optional `suffix`, e.g. a user id or
 * date bucket). When over the limit it also logs a structured trip warning.
 */
export function checkRateLimit(
    request: NextRequest,
    scope: string,
    options: RateLimitOptions,
    suffix = ""
): RateLimitResult {
    cleanup();
    const now = Date.now();
    const ip = getClientIp(request);
    const key = `${scope}:${ip}:${suffix}`;
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + options.windowMs });
        return { allowed: true, retryAfterSeconds: 0 };
    }
    if (bucket.count >= options.limit) {
        const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
        log.warn("rate-limit", "request rate limited", {
            scope,
            ip,
            suffix,
            retryAfterSeconds,
        });
        return { allowed: false, retryAfterSeconds };
    }
    bucket.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
}

const RATE_LIMITED_MESSAGE = "Too many requests. Please try again later.";

/**
 * Standard 429 response. Always uses the same message and `RATE_LIMITED` code
 * as `rateLimited()` in `@/lib/api/errors`, and carries `Retry-After` when a
 * result is provided.
 */
export function rateLimitedResponse(result?: RateLimitResult) {
    return NextResponse.json(
        { error: RATE_LIMITED_MESSAGE, code: "RATE_LIMITED" },
        {
            status: 429,
            ...(result?.retryAfterSeconds
                ? { headers: { "Retry-After": String(result.retryAfterSeconds) } }
                : {}),
        }
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NextHandler = (request: NextRequest, ...args: any[]) => any;

interface RateLimitConfig {
    windowMs: number;
    max: number;
}

/**
 * Route-wrapper middleware (used by the better-auth catch-all route).
 * Delegates to the same store, message, and Retry-After handling as
 * `checkRateLimit`/`rateLimitedResponse` so there is exactly one implementation.
 */
export function rateLimit(config: RateLimitConfig, handler: NextHandler): NextHandler {
    return async (request: NextRequest, ...args: unknown[]) => {
        const result = checkRateLimit(request, `better-auth:${request.method}`, {
            limit: config.max,
            windowMs: config.windowMs,
        });
        if (!result.allowed) return rateLimitedResponse(result);
        return handler(request, ...args);
    };
}
