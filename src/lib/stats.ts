import { prisma } from "@/lib/prisma";
import { ApplicationStatus, ProjectStatus } from "@prisma/client";

/**
 * Computes the platform-wide stats shown on the admin analytics page and used
 * by the weekly report email. Shared so both consumers query exactly once.
 */
export async function getPlatformStats() {
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

    return {
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
    };
}

export type PlatformStats = Awaited<ReturnType<typeof getPlatformStats>>;