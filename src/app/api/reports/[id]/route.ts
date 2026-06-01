import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { reportUpdateSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * PATCH /api/reports/[id]
 * Update report status (admin only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
            return NextResponse.json(
                makeValidationError("Report not found", "id"),
                { status: 404 }
            );
        }

        const report = await prisma.report.update({
            where: { id },
            data: {
                status,
                resolvedBy: session.user.id,
                resolvedAt: new Date(),
            },
        });

        return NextResponse.json({ report });
    } catch (error) {
        console.error("[API] Update report error:", error);
        return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
    }
}
