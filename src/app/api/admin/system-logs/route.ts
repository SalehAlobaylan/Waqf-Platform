import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { systemLogsQuerySchema } from "@/lib/validation/schemas";
import { parseQuery } from "@/lib/validation/parse";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { pruneSystemErrorLogs } from "@/lib/system-error-log";

const RETENTION_DEFAULT_DAYS = 30;

/**
 * GET /api/admin/system-logs
 * List persisted server error records (admin only), newest first.
 */
export async function GET(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.admin.systemLogs.list", async () => {
        const admin = await requireAdminOrThrow();
        ctx.userId = admin.id;

        const rate = checkRateLimit(request, "system-logs-list", { limit: 60, windowMs: 60_000 }, admin.id);
        if (!rate.allowed) {
            return rateLimitedResponse(rate);
        }

        const parsedQuery = parseQuery(request, systemLogsQuerySchema);
        if (!parsedQuery.success) {
            return NextResponse.json(parsedQuery.error, { status: 400 });
        }

        const { page, limit, status, code } = parsedQuery.data;

        const where: Prisma.SystemErrorLogWhereInput = {
            ...(status !== undefined ? { status } : {}),
            ...(code ? { code } : {}),
        };

        // Retention safety net: drop rows older than the retention window even
        // when the explicit clear action is never invoked.
        await pruneSystemErrorLogs(90);

        const [logs, total] = await Promise.all([
            prisma.systemErrorLog.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.systemErrorLog.count({ where }),
        ]);

        return NextResponse.json({
            logs,
            total,
            page,
            pages: Math.max(1, Math.ceil(total / limit)),
        });
    }, ctx);
}

/**
 * DELETE /api/admin/system-logs
 * Clear persisted error records older than ?olderThanDays= (default 30).
 */
export async function DELETE(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.admin.systemLogs.clear", async () => {
        const admin = await requireAdminOrThrow();
        ctx.userId = admin.id;

        const rate = checkRateLimit(request, "system-logs-clear", { limit: 20, windowMs: 60_000 }, admin.id);
        if (!rate.allowed) {
            return rateLimitedResponse(rate);
        }

        const requestedDays = Number(new URL(request.url).searchParams.get("olderThanDays"));
        const olderThanDays = Number.isFinite(requestedDays) && requestedDays >= 1 ? Math.floor(requestedDays) : RETENTION_DEFAULT_DAYS;
        const cap = Math.min(olderThanDays, 3650);

        const deleted = await pruneSystemErrorLogs(cap);
        return NextResponse.json({ deleted });
    }, ctx);
}