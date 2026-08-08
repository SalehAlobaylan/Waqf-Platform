import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ApplicationStatus, ProjectStatus } from "@prisma/client";

export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });

        if (currentUser?.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);

        const [
            totalUsers,
            totalProjects,
            totalApplications,
            pendingProjects,
            activeProjects,
            newUsersThisMonth,
            newProjectsThisMonth,
            newApplicationsThisWeek,
            applicationsByStatus,
            projectsByStatus,
            recentProjects,
            topContributors,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.project.count(),
            prisma.application.count(),
            prisma.project.count({ where: { status: ProjectStatus.PENDING } }),
            prisma.project.count({ where: { status: ProjectStatus.OPEN } }),
            prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
            prisma.project.count({ where: { createdAt: { gte: startOfMonth } } }),
            prisma.application.count({ where: { createdAt: { gte: startOfWeek } } }),
            prisma.application.groupBy({
                by: ["status"],
                _count: { _all: true },
            }),
            prisma.project.groupBy({
                by: ["status"],
                _count: { _all: true },
            }),
            prisma.project.findMany({
                orderBy: { createdAt: "desc" },
                take: 5,
                select: {
                    id: true,
                    title: true,
                    status: true,
                    source: true,
                    createdAt: true,
                    owner: { select: { name: true, image: true } },
                },
            }),
            prisma.user.findMany({
                take: 5,
                orderBy: { applications: { _count: "desc" } },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    _count: { select: { applications: true } },
                },
            }),
        ]);

        const projectsByStatusMap: Record<string, number> = {
            DRAFT: 0,
            PENDING: 0,
            OPEN: 0,
            IN_PROGRESS: 0,
            COMPLETED: 0,
            CANCELLED: 0,
        };
        projectsByStatus.forEach((row) => {
            projectsByStatusMap[row.status] = row._count._all;
        });

        const applicationsByStatusMap: Record<string, number> = {
            PENDING: 0,
            ACCEPTED: 0,
            REJECTED: 0,
            WITHDRAWN: 0,
        };
        applicationsByStatus.forEach((row) => {
            applicationsByStatusMap[row.status] = row._count._all;
        });

        const accepted = applicationsByStatusMap[ApplicationStatus.ACCEPTED] || 0;
        const rejected = applicationsByStatusMap[ApplicationStatus.REJECTED] || 0;
        const totalDecided = accepted + rejected;
        const acceptanceRate = totalDecided > 0 ? Math.round((accepted / totalDecided) * 100) : 0;

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
                acceptanceRate,
            },
            breakdown: {
                projectsByStatus: projectsByStatusMap,
                applicationsByStatus: applicationsByStatusMap,
            },
            recent: {
                projects: recentProjects,
                topContributors,
            },
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch statistics" },
            { status: 500 }
        );
    }
}
