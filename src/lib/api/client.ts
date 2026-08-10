export type ApiErrorCode =
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "VALIDATION_FAILED"
    | "INVALID_JSON"
    | "CONFLICT"
    | "RATE_LIMITED"
    | "INTERNAL"
    | "SERVICE_UNAVAILABLE";

export interface ApiErrorDetail {
    path: string;
    message: string;
    code?: string;
}

/**
 * Client-side mirror of the server error contract. Thrown by `apiFetch` for
 * any non-2xx response; `code` is stable and localizable.
 */
export class ApiError extends Error {
    readonly status: number;
    readonly code: ApiErrorCode | string;
    readonly details?: ApiErrorDetail[];

    constructor(opts: {
        status: number;
        code: ApiErrorCode | string;
        message: string;
        details?: ApiErrorDetail[];
    }) {
        super(opts.message);
        this.name = "ApiError";
        this.status = opts.status;
        this.code = opts.code;
        this.details = opts.details;
    }
}

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

interface ApiFetchOptions {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    query?: Record<string, string | number | boolean | undefined | null>;
    headers?: Record<string, string>;
    signal?: AbortSignal;
}

/**
 * Typed fetch wrapper for client components. Reads the standardized
 * `{ error, code, details }` response contract and throws a typed `ApiError`
 * on non-2xx responses so callers never parse raw network text.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
    const { method = "GET", body, query, headers, signal } = options;

    const url = new URL(path, window.location.origin);
    if (query) {
        for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && value !== null && value !== "") {
                url.searchParams.set(key, String(value));
            }
        }
    }

    const res = await fetch(url, {
        method,
        headers: {
            ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
            ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal,
    });

    let data: unknown = null;
    try {
        data = await res.json();
    } catch {
        // Non-JSON body — treated as a generic failure below.
    }

    if (!res.ok) {
        const errorBody = (data ?? {}) as {
            error?: string;
            code?: string;
            details?: ApiErrorDetail[];
        };
        throw new ApiError({
            status: res.status,
            code: errorBody.code ?? "INTERNAL",
            message: errorBody.error ?? (res.statusText || `Request failed with status ${res.status}`),
            details: errorBody.details,
        });
    }

    return data as T;
}
