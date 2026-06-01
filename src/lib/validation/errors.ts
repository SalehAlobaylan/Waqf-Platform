import { ZodError } from "zod";

export type ValidationErrorDetail = {
    path: string;
    message: string;
};

export type ValidationErrorResponse = {
    error: "Validation failed";
    details: ValidationErrorDetail[];
};

export function formatZodError(error: ZodError): ValidationErrorResponse {
    return {
        error: "Validation failed",
        details: error.issues.map((issue) => ({
            path: issue.path.length > 0 ? issue.path.join(".") : "",
            message: issue.message,
        })),
    };
}

export function makeValidationError(message: string, path = ""): ValidationErrorResponse {
    return {
        error: "Validation failed",
        details: [{ path, message }],
    };
}
