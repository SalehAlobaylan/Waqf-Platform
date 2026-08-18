import { prisma } from "@/lib/prisma";
import { log } from "@/lib/logger";

export interface SystemErrorLogInput {
    scope: string;
    status: number;
    code: string;
    message: string;
    method: string;
    path: string;
    userId?: string | null;
    stack?: string | null;
}

/**
 * Persists a server-side error record (best-effort) so admins can triage
 * production 5xx failures without an external monitoring service. Never
 * throws: a failing log write must not break the request it is reporting on.
 * Request bodies/emails are deliberately NOT stored.
 */
export async function recordSystemError(input: SystemErrorLogInput): Promise<void> {
    try {
        await prisma.systemErrorLog.create({ data: input });
    } catch (error) {
        log.warn("system-error-log", "failed to persist error record", {
            scope: input.scope,
            status: input.status,
        }, error);
    }
}

/**
 * Deletes error records older than `olderThanDays`. Returns the number of
 * rows removed. Used for retention (auto-prune) and the admin clear action.
 */
export async function pruneSystemErrorLogs(olderThanDays: number): Promise<number> {
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    const result = await prisma.systemErrorLog.deleteMany({
        where: { createdAt: { lt: cutoff } },
    });
    return result.count;
}