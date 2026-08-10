import { ZodError, ZodSchema } from "zod";
import { formatZodError, ValidationErrorResponse } from "@/lib/validation/errors";

type ParseResult<T> =
    | { success: true; data: T }
    | { success: false; error: ValidationErrorResponse };

export async function parseBody<T>(request: Request, schema: ZodSchema<T>): Promise<ParseResult<T>> {
    try {
        const body = await request.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return { success: false, error: formatZodError(parsed.error) };
        }
        return { success: true, data: parsed.data };
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: formatZodError(error) };
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
