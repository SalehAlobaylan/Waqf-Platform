/**
 * Domain/business-rule error for campaign operations. Carries a stable
 * `code` that route handlers map to user-facing 4xx responses. `message` is
 * safe to surface (no internal enum values or state-machine details).
 */
export class DomainError extends Error {
    readonly code: string;

    constructor(code: string, message: string) {
        super(message);
        this.name = "DomainError";
        this.code = code;
    }
}
