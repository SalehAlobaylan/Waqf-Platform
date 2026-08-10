import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";

export async function GET(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.stats.get", async () => {
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
    }, ctx);
}
