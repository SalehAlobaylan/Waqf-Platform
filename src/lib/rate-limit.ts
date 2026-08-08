import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

interface RateLimitConfig {
    windowMs: number;
    max: number;
}

export interface RateLimitOptions {
    limit: number;
    windowMs: number;
}

interface Bucket {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// In-memory sliding window per (scope, ip, suffix). Note: this is
// per-instance state — correct for a single-instance deployment, and must be
// replaced with a shared store (Redis/Upstash) before scaling horizontally.
const buckets = new Map<string, Bucket>();

const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    for (const [key, entry] of store) {
        if (now > entry.resetTime) {
            store.delete(key);
        }
    }
    for (const [key, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(key);
    }
}

function getClientIp(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    const realIp = request.headers.get("x-real-ip");
    if (realIp) return realIp;
    return "unknown";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NextHandler = (request: NextRequest, ...args: any[]) => any;

export function rateLimit(
    config: RateLimitConfig,
    handler: NextHandler
): NextHandler {
    return async (request: NextRequest, ...args: unknown[]) => {
        cleanup();

        const ip = getClientIp(request);
        const now = Date.now();
        const key = `rate-limit:${request.method}:${ip}`;

        const entry = store.get(key);

        if (!entry || now > entry.resetTime) {
            store.set(key, { count: 1, resetTime: now + config.windowMs });
            return handler(request, ...args);
        }

        if (entry.count >= config.max) {
            return new NextResponse(
                JSON.stringify({ error: "Too many requests. Please try again later." }),
                {
                    status: 429,
                    headers: {
                        "Content-Type": "application/json",
                        "Retry-After": String(Math.ceil((entry.resetTime - now) / 1000)),
                    },
                }
            );
        }

        entry.count++;
        return handler(request, ...args);
    };
}

export function parseIpForRateLimit(request: NextRequest): string {
    return getClientIp(request);
}

/**
 * Returns true when the request is within the limit, false when rate-limited.
 */
export function checkRateLimit(
    request: NextRequest,
    scope: string,
    options: RateLimitOptions,
    suffix = ""
): boolean {
    cleanup();
    const now = Date.now();
    const key = `${scope}:${getClientIp(request)}:${suffix}`;
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + options.windowMs });
        return true;
    }
    if (bucket.count >= options.limit) return false;
    bucket.count += 1;
    return true;
}

export function rateLimitedResponse() {
    return NextResponse.json(
        { error: "Too many requests, please try again later" },
        { status: 429 }
    );
}
