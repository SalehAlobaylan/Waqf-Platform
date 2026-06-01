import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

const store = new Map<string, RateLimitEntry>();

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
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "127.0.0.1";
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
    const key = `rate-limit:${ip}`;

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
