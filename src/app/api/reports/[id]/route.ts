import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!status || !["REVIEWED", "RESOLVED", "DISMISSED"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
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
