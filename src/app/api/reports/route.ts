import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuthOrThrow, requireAdminOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { reportCreateSchema, reportsQuerySchema } from "@/lib/validation/schemas";
import { parseBody, parseQuery } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

/**
 * POST /api/reports
 * Submit a content report
 */
export async function POST(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.reports.create", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const rate = checkRateLimit(request, "report-create", { limit: 5, windowMs: 60_000 }, user.id);
        if (!rate.allowed) {
            return rateLimitedResponse(rate);
        }

        const parsedBody = await parseBody(request, reportCreateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const { targetType, targetId, reason, details } = parsedBody.data;

        // Prevent duplicate reports
        const existing = await prisma.report.findFirst({
            where: {
                reporterId: user.id,
                targetType,
                targetId,
                status: "PENDING",
            },
        });

        if (existing) {
            return NextResponse.json(
                makeValidationError("You have already reported this content", "targetId"),
                { status: 400 }
            );
        }

        const report = await prisma.report.create({
            data: {
                reporterId: user.id,
                targetType,
                targetId,
                reason,
                details: details || null,
            },
        });

        return NextResponse.json({ report }, { status: 201 });
    }, ctx);
}

/**
 * GET /api/reports
 * List reports (admin only)
 */
export async function GET(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.reports.list", async () => {
        const admin = await requireAdminOrThrow();
        ctx.userId = admin.id;

        const parsedQuery = parseQuery(request, reportsQuerySchema);
        if (!parsedQuery.success) {
            return NextResponse.json(parsedQuery.error, { status: 400 });
        }

        const status = parsedQuery.data.status;

        const where: Prisma.ReportWhereInput | undefined = status ? { status } : undefined;

        const reports = await prisma.report.findMany({
            where,
            include: {
                reporter: {
                    select: { id: true, name: true, email: true, image: true },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        });

        return NextResponse.json({ reports });
    }, ctx);
}
