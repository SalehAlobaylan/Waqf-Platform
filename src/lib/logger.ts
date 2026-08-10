export type LogContext = Record<string, unknown>;

const isProd = process.env.NODE_ENV === "production";

function serializeError(error: unknown): Record<string, unknown> {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
            ...(error.cause !== undefined
                ? { cause: error.cause instanceof Error ? serializeError(error.cause) : error.cause }
                : {}),
        };
    }
    return { value: String(error) };
}

/**
 * Masks an email address for logs (PII protection): `saleh@waqf.app` →
 * `s***@waqf.app`. Recipient addresses are never written to logs in full.
 */
export function maskEmail(email: string): string {
    const [local, domain] = email.split("@");
    if (!domain) return "<redacted>";
    const head = local.slice(0, 1) || "*";
    return `${head}***@${domain}`;
}

function write(level: "error" | "warn" | "info" | "debug", scope: string, message: string, context?: LogContext, error?: unknown) {
    const base: LogContext = {
        level,
        scope,
        time: new Date().toISOString(),
        message,
    };
    const record = { ...base, ...(context ?? {}) };
    if (error !== undefined) {
        record.error = serializeError(error);
    }

    const line = JSON.stringify(record);
    if (level === "error") {
        // eslint-disable-next-line no-console
        console.error(line);
    } else if (level === "warn") {
        // eslint-disable-next-line no-console
        console.warn(line);
    } else {
        // eslint-disable-next-line no-console
        console.log(line);
    }
}

/**
 * Lightweight structured logger. Prefer over raw `console.*` in server code so
 * logs carry consistent scope, timing, and error context that are greppable in
 * production log aggregators. `debug` is omitted in production builds.
 */
export const log = {
    error: (scope: string, message: string, context?: LogContext, error?: unknown) =>
        write("error", scope, message, context, error),
    warn: (scope: string, message: string, context?: LogContext, error?: unknown) =>
        write("warn", scope, message, context, error),
    info: (scope: string, message: string, context?: LogContext) =>
        write("info", scope, message, context),
    debug: (scope: string, message: string, context?: LogContext) => {
        if (!isProd) write("debug", scope, message, context);
    },
};
