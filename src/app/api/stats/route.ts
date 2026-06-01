import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const [totalProjects, totalContributors, totalContributions] = await Promise.all([
            prisma.project.count(),
            prisma.contributorProfile.count(),
            prisma.application.count(),
        ]);

        return NextResponse.json({
            totalProjects,
            totalContributors,
            totalContributions,
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch statistics" },
            { status: 500 }
        );
    }
}
