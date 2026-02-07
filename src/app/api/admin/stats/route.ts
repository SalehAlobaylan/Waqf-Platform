import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * GET /api/admin/stats
 * Get comprehensive admin statistics
 */
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });

        if (user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get current date and dates for comparison
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Aggregate all stats in parallel
        const [
            totalUsers,
            totalProjects,
            totalApplications,
            pendingProjects,
            activeProjects,
            newUsersThisMonth,
            newProjectsThisMonth,
            newApplicationsThisWeek,
            acceptedApplications,
            projectsByStatus,
            applicationsByStatus,
            recentProjects,
            topContributors,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.project.count(),
            prisma.application.count(),
            prisma.project.count({ where: { status: "PENDING" } }),
            prisma.project.count({ where: { status: "OPEN" } }),
            prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            prisma.project.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            prisma.application.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
            prisma.application.count({ where: { status: "ACCEPTED" } }),
            prisma.project.groupBy({
                by: ["status"],
                _count: true,
            }),
            prisma.application.groupBy({
                by: ["status"],
                _count: true,
            }),
            prisma.project.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: {
                    owner: { select: { name: true, avatar: true } },
                },
            }),
            prisma.user.findMany({
                take: 5,
                orderBy: {
                    applications: { _count: "desc" },
                },
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                    _count: {
                        select: { applications: true },
                    },
                },
            }),
        ]);

        // Transform grouped data to objects
        const projectStatusMap = projectsByStatus.reduce((acc, item) => {
            acc[item.status] = item._count;
            return acc;
        }, {} as Record<string, number>);

        const applicationStatusMap = applicationsByStatus.reduce((acc, item) => {
            acc[item.status] = item._count;
            return acc;
        }, {} as Record<string, number>);

        return NextResponse.json({
            overview: {
                totalUsers,
                totalProjects,
                totalApplications,
                pendingProjects,
                activeProjects,
            },
            growth: {
                newUsersThisMonth,
                newProjectsThisMonth,
                newApplicationsThisWeek,
            },
            rates: {
                acceptanceRate: totalApplications > 0 
                    ? Math.round((acceptedApplications / totalApplications) * 100) 
                    : 0,
            },
            breakdown: {
                projectsByStatus: projectStatusMap,
                applicationsByStatus: applicationStatusMap,
            },
            recent: {
                projects: recentProjects,
                topContributors,
            },
        });
    } catch (error) {
        console.error("[API] Admin stats error:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}
