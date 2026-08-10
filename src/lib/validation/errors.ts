import { ZodError } from "zod";

export type ValidationErrorDetail = {
    path: string;
    message: string;
    code?: string;
};

export type ValidationErrorResponse = {
    error: "Validation failed";
    code: "VALIDATION_FAILED" | "INVALID_JSON";
    details: ValidationErrorDetail[];
};

export function formatZodError(error: ZodError): ValidationErrorResponse {
    return {
        error: "Validation failed",
        code: "VALIDATION_FAILED",
        details: error.issues.map((issue) => ({
            path: issue.path.length > 0 ? issue.path.join(".") : "",
            message: issue.message,
        })),
    };
}

export function makeValidationError(message: string, path = ""): ValidationErrorResponse {
    return {
        error: "Validation failed",
        code: "VALIDATION_FAILED",
        details: [{ path, message }],
    };
}

/**
 * 404 response shape. Uses the standard `{ error, code, details }` contract
 * with a `NOT_FOUND` code (not the validation shape, which was misleading).
 */
export function makeNotFoundError(message: string, path = ""): {
    error: "Not found";
    code: "NOT_FOUND";
    details: ValidationErrorDetail[];
} {
    return {
        error: "Not found",
        code: "NOT_FOUND",
        details: [{ path, message }],
    };
}
