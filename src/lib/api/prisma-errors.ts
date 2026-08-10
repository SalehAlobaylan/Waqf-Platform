import { Prisma } from "@prisma/client";
import { ErrorResponseBody } from "@/lib/api/errors";

/**
 * Maps known Prisma errors to a stable HTTP response. Returns null when the
 * error is not a recognizable Prisma failure so the caller falls back to a
 * generic 500. Never include the raw error message — it can leak query
 * details / table names to clients.
 */
export function mapPrismaError(
    error: unknown
): { status: number; body: ErrorResponseBody } | null {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2002": // Unique constraint failed
                return {
                    status: 409,
                    body: {
                        error: "A record with the same unique value already exists",
                        code: "CONFLICT",
                    },
                };
            case "P2003": // Foreign key constraint failed
                return {
                    status: 409,
                    body: {
                        error: "The record references a resource that no longer exists",
                        code: "CONFLICT",
                    },
                };
            case "P2025": // Record not found
            case "P2018": // Required connected record not found
                return {
                    status: 404,
                    body: { error: "Record not found", code: "NOT_FOUND" },
                };
            default:
                return null;
        }
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
        return {
            status: 503,
            body: { error: "Database is unavailable", code: "SERVICE_UNAVAILABLE" },
        };
    }

    if (error instanceof Prisma.PrismaClientRustPanicError) {
        return {
            status: 503,
            body: { error: "Database is unavailable", code: "SERVICE_UNAVAILABLE" },
        };
    }

    return null;
}
