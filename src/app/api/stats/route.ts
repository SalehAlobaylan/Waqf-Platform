import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/stats
 * Get platform statistics for landing page
 */
export async function GET() {
    try {
        const [projectCount, userCount, applicationCount] = await Promise.all([
            prisma.project.count({
                where: { status: "OPEN" },
            }),
            prisma.user.count(),
            prisma.application.count({
                where: { status: "ACCEPTED" },
            }),
        ]);

        return NextResponse.json({
            projects: projectCount,
            contributors: userCount,
            contributions: applicationCount,
        });
    } catch (error) {
        console.error("[API] Get stats error:", error);
        // Return fallback stats if database fails
        return NextResponse.json({
            projects: 0,
            contributors: 0,
            contributions: 0,
        });
    }
}
