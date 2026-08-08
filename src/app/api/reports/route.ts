import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { reportCreateSchema, reportsQuerySchema } from "@/lib/validation/schemas";
import { parseBody, parseQuery } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";
import { requireAdmin } from "@/lib/auth-helpers";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

/**
 * POST /api/reports
 * Submit a content report
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        if (!checkRateLimit(request, "report-create", { limit: 5, windowMs: 60_000 }, session.user.id)) {
            return rateLimitedResponse();
        }

        const parsedBody = await parseBody(request, reportCreateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const { targetType, targetId, reason, details } = parsedBody.data;

        // Prevent duplicate reports
        const existing = await prisma.report.findFirst({
            where: {
                reporterId: session.user.id,
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
                reporterId: session.user.id,
                targetType,
                targetId,
                reason,
                details: details || null,
            },
        });

        return NextResponse.json({ report }, { status: 201 });
    } catch (error) {
        console.error("[API] Create report error:", error);
        return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
    }
}

/**
 * GET /api/reports
 * List reports (admin only)
 */
export async function GET(request: NextRequest) {
    try {
        const { admin, response } = await requireAdmin();
        if (response) return response;

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
    } catch (error) {
        console.error("[API] Get reports error:", error);
        return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
    }
}
