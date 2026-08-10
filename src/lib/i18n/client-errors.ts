import { isApiError, ApiError } from "@/lib/api/client";

/**
 * Maps a server error code to its i18n key under the `errors` namespace.
 * Unknown codes fall back to a generic message.
 */
export const ERROR_CODE_KEYS: Record<string, string> = {
    UNAUTHORIZED: "errors.unauthorized",
    FORBIDDEN: "errors.forbidden",
    NOT_FOUND: "errors.notFound",
    VALIDATION_FAILED: "errors.validationFailed",
    INVALID_JSON: "errors.invalidJson",
    CONFLICT: "errors.conflict",
    RATE_LIMITED: "errors.rateLimited",
    INTERNAL: "errors.internal",
    SERVICE_UNAVAILABLE: "errors.serviceUnavailable",
};

export function errorCodeKey(code?: string): string {
    return (code && ERROR_CODE_KEYS[code]) || "errors.unexpected";
}

/**
 * Returns a localized message for a thrown error. `t` must be the un-scoped
 * next-intl translation function from `useTranslations()` (not a scoped
 * namespace). Non-`ApiError` failures (network, unexpected throws) resolve to
 * a generic "something went wrong" message.
 */
export function translateApiError(
    t: (key: string) => string,
    error: unknown
): string {
    if (isApiError(error)) {
        return t(errorCodeKey(error.code));
    }
    return t("errors.unexpected");
}

/**
 * Returns the first field-level detail message from a validation error, if any.
 */
export function firstValidationMessage(error: unknown): string | undefined {
    if (error instanceof ApiError && error.code === "VALIDATION_FAILED" && error.details?.length) {
        return error.details[0].message;
    }
    return undefined;
}
