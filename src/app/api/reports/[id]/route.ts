import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { reportUpdateSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { makeNotFoundError } from "@/lib/validation/errors";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * PATCH /api/reports/[id]
 * Update report status (admin only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.reports.update", async () => {
        const admin = await requireAdminOrThrow();
        ctx.userId = admin.id;

        const rate = checkRateLimit(request, "report-update", { limit: 30, windowMs: 60_000 }, admin.id);
        if (!rate.allowed) {
            return rateLimitedResponse(rate);
        }

        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }

        const parsedBody = await parseBody(request, reportUpdateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const { id } = parsedParams.data;
        const { status } = parsedBody.data;

        const existing = await prisma.report.findUnique({ where: { id }, select: { id: true } });
        if (!existing) {
            return NextResponse.json(makeNotFoundError("Report not found", "id"), { status: 404 });
        }

        const report = await prisma.report.update({
            where: { id },
            data: {
                status,
                resolvedBy: admin.id,
                resolvedAt: new Date(),
            },
        });

        return NextResponse.json({ report });
    }, ctx);
}
