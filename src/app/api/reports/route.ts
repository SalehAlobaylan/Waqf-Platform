import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

        const body = await request.json();
        const { targetType, targetId, reason, details } = body;

        if (!targetType || !targetId || !reason) {
            return NextResponse.json(
                { error: "targetType, targetId, and reason are required" },
                { status: 400 }
            );
        }

        if (!["PROJECT", "USER", "APPLICATION"].includes(targetType)) {
            return NextResponse.json(
                { error: "Invalid target type" },
                { status: 400 }
            );
        }

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
                { error: "You have already reported this content" },
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
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");

        const reports = await prisma.report.findMany({
            where: status ? { status: status as any } : undefined,
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
