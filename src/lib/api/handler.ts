import { NextRequest, NextResponse } from "next/server";
import { AppError, isAppError, ErrorResponseBody } from "@/lib/api/errors";
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
 * Wraps a route handler with centralized error handling:
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
            userId: context?.userId,
        }, error);
        return NextResponse.json(body, { status });
    }
}
