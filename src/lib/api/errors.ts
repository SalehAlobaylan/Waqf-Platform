export type ErrorCode =
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "VALIDATION_FAILED"
    | "INVALID_JSON"
    | "CONFLICT"
    | "RATE_LIMITED"
    | "INTERNAL"
    | "SERVICE_UNAVAILABLE";

export type ErrorDetail = {
    path: string;
    message: string;
    code?: string;
};

export type ErrorResponseBody = {
    error: string;
    code: ErrorCode;
    details?: ErrorDetail[];
};

/**
 * Domain error carrying an HTTP status and a stable, machine-readable code.
 * Throw from route handlers; `withApiHandler` renders it as the standard
 * `{ error, code, details? }` response shape. `message` is a server-side
 * English default; clients localize by `code`.
 */
export class AppError extends Error {
    readonly status: number;
    readonly code: ErrorCode;
    readonly details?: ErrorDetail[];

    constructor(opts: {
        status: number;
        code: ErrorCode;
        message: string;
        details?: ErrorDetail[];
        cause?: unknown;
    }) {
        super(opts.message);
        this.name = "AppError";
        this.status = opts.status;
        this.code = opts.code;
        this.details = opts.details;
        if (opts.cause !== undefined) {
            this.cause = opts.cause;
        }
    }
}

export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
}

export function unauthorized(message = "Unauthorized"): AppError {
    return new AppError({ status: 401, code: "UNAUTHORIZED", message });
}

export function forbidden(message = "Forbidden"): AppError {
    return new AppError({ status: 403, code: "FORBIDDEN", message });
}

export function notFound(message: string, path?: string): AppError {
    return new AppError({
        status: 404,
        code: "NOT_FOUND",
        message: "Not found",
        details: path ? [{ path, message }] : undefined,
    });
}

export function conflict(message = "Conflict"): AppError {
    return new AppError({ status: 409, code: "CONFLICT", message });
}

export function validationError(message: string, path = "", code?: string): AppError {
    return new AppError({
        status: 400,
        code: "VALIDATION_FAILED",
        message: "Validation failed",
        details: [{ path, message, code }],
    });
}

export function invalidJson(): AppError {
    return new AppError({
        status: 400,
        code: "INVALID_JSON",
        message: "Invalid JSON payload",
    });
}

export function rateLimited(message = "Too many requests. Please try again later."): AppError {
    return new AppError({ status: 429, code: "RATE_LIMITED", message });
}
