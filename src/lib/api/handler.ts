import { NextResponse } from "next/server";
import { isAppError, ErrorResponseBody } from "@/lib/api/errors";
import { mapPrismaError } from "@/lib/api/prisma-errors";
import { log } from "@/lib/logger";

/**
 * Converts any thrown value into the standardized error response shape.
 * - AppError → its own status/code/details
 * - Prisma errors → mapped (409/404/503) via mapPrismaError
 * - Anything else → generic 500, never leaking the raw message
 */
export function toErrorResponse(error: unknown): { status: number; body: ErrorResponseBody } {
    if (isAppError(error)) {
        return {
            status: error.status,
            body: {
                error: error.message,
                code: error.code,
                ...(error.details !== undefined ? { details: error.details } : {}),
            },
        };
    }

    const prismaMapped = mapPrismaError(error);
    if (prismaMapped) return prismaMapped;

    return {
        status: 500,
        body: { error: "Internal server error", code: "INTERNAL" },
    };
}

export type ApiHandlerContext = {
    /** Optional caller id for log correlation. */
    userId?: string;
};

/**
 * Origins allowed to make state-changing requests. Derived from
 * NEXT_PUBLIC_APP_URL (the app's own origin) plus an optional extra list in
 * ALLOWED_ORIGINS (comma-separated). Cross-site browsers always send an
 * Origin header on state-changing requests, so rejecting unknown origins
 * neutralizes CSRF for browser clients.
 */
function getAllowedOrigins(): Set<string> {
    const origins = new Set<string>();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl) origins.add(appUrl.replace(/\/+$/, ""));
    for (const origin of (process.env.ALLOWED_ORIGINS || "").split(",")) {
        const trimmed = origin.trim();
        if (trimmed) origins.add(trimmed.replace(/\/+$/, ""));
    }
    return origins;
}

const isDev = process.env.NODE_ENV !== "production";

/**
 * Rejects cross-origin browser requests by comparing the request Origin (or,
 * failing that, Referer) against the app's allowed origins. Returns the
 * request's origin when the request is safe, or null when it must be blocked.
 * Non-browser clients (no Origin/Referer) are allowed through.
 */
function checkOrigin(request: Request): { allowed: boolean; origin?: string } {
    if (isDev) return { allowed: true };
    const allowed = getAllowedOrigins();

    const header = request.headers.get("origin") || request.headers.get("referer");
    if (!header) return { allowed: true };

    let origin: string;
    try {
        origin = new URL(header).origin;
    } catch {
        return { allowed: false };
    }

    // When no origins are configured we can't enumerate the trusted set, but
    // the request's own origin is always safe: it means the browser called the
    // API from the same site it is being served from.
    if (allowed.size === 0) {
        try {
            const selfOrigin = new URL(request.url).origin;
            if (origin === selfOrigin) return { allowed: true, origin };
        } catch {
            // fall through to rejection below
        }
        return { allowed: false, origin };
    }

    return allowed.has(origin) ? { allowed: true, origin } : { allowed: false, origin };
}

/**
 * Wraps a route handler with centralized error handling:
 * - rejects cross-origin requests (CSRF) before the handler runs
 * - catches thrown errors and maps them to the standard `{ error, code }` shape
 * - logs failures with request context (method, path, userId) via `log`
 * - never serializes the underlying error message into the response
 *
 * Usage: export async function GET(request: NextRequest) {
 *   return withApiHandler(request, "api.campaigns.list", async () => { ... });
 * }
 */
export async function withApiHandler(
    request: Request,
    scope: string,
    handler: () => Promise<Response>,
    context?: ApiHandlerContext
): Promise<Response> {
    const origin = checkOrigin(request);
    if (!origin.allowed) {
        return NextResponse.json(
            { error: "Forbidden", code: "FORBIDDEN" },
            { status: 403 }
        );
    }
    try {
        return await handler();
    } catch (error) {
        const { status, body } = toErrorResponse(error);
        let path = "unknown";
        try {
            path = new URL(request.url).pathname;
        } catch {
            // ignore malformed url
        }
        log.error(scope, body.error, {
            status,
            code: body.code,
            method: request.method,
            path,
            origin: origin.origin,
            userId: context?.userId,
        }, error);
        return NextResponse.json(body, { status });
    }
}
