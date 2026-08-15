import { ZodError, ZodSchema } from "zod";
import { formatZodError, ValidationErrorResponse } from "@/lib/validation/errors";

type ParseResult<T> =
    | { success: true; data: T }
    | { success: false; error: ValidationErrorResponse };

/** Cap on request body size, enforced by parseBody to bound memory usage. */
const MAX_BODY_BYTES = 1024 * 1024; // 1 MB

class BodyTooLargeError extends Error {
    constructor() {
        super("Request body too large");
        this.name = "BodyTooLargeError";
    }
}

/**
 * Reads the request body as text while enforcing a hard byte cap. Rejects
 * early on an oversized `Content-Length`, and otherwise streams the body in
 * chunks so a chunked (no-length) payload can't exhaust memory. Returns an
 * empty string when there is no body.
 */
async function readBodyText(request: Request, maxBytes: number): Promise<string> {
    const contentLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > maxBytes) {
        throw new BodyTooLargeError();
    }

    if (!request.body) {
        const text = await request.text();
        if (Buffer.byteLength(text, "utf8") > maxBytes) throw new BodyTooLargeError();
        return text;
    }

    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            total += value.byteLength;
            if (total > maxBytes) throw new BodyTooLargeError();
            chunks.push(value);
        }
    } finally {
        reader.releaseLock();
    }

    if (chunks.length === 0) return "";

    const merged = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.byteLength;
    }
    return new TextDecoder().decode(merged);
}

export async function parseBody<T>(request: Request, schema: ZodSchema<T>): Promise<ParseResult<T>> {
    try {
        const text = await readBodyText(request, MAX_BODY_BYTES);
        if (text.trim().length === 0) {
            return {
                success: false,
                error: {
                    error: "Validation failed",
                    code: "INVALID_JSON",
                    details: [{ path: "", message: "Invalid JSON payload" }],
                },
            };
        }
        const body: unknown = JSON.parse(text);
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return { success: false, error: formatZodError(parsed.error) };
        }
        return { success: true, data: parsed.data };
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: formatZodError(error) };
        }
        if (error instanceof BodyTooLargeError) {
            return {
                success: false,
                error: {
                    error: "Validation failed",
                    code: "VALIDATION_FAILED",
                    details: [{ path: "", message: "Request body is too large" }],
                },
            };
        }
        return {
            success: false,
            error: {
                error: "Validation failed",
                code: "INVALID_JSON",
                details: [{ path: "", message: "Invalid JSON payload" }],
            },
        };
    }
}

export function parseQuery<T>(request: Request, schema: ZodSchema<T>): ParseResult<T> {
    const { searchParams } = new URL(request.url);
    const raw = Object.fromEntries(searchParams.entries());
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
        return { success: false, error: formatZodError(parsed.error) };
    }
    return { success: true, data: parsed.data };
}

export function parseParams<T>(params: unknown, schema: ZodSchema<T>): ParseResult<T> {
    const parsed = schema.safeParse(params);
    if (!parsed.success) {
        return { success: false, error: formatZodError(parsed.error) };
    }
    return { success: true, data: parsed.data };
}

export function normalizeQueryValue(value: string | null): string | undefined {
    if (value === null) return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}
