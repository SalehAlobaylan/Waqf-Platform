import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { adminProjectsQuerySchema } from "@/lib/validation/schemas";
import { parseQuery } from "@/lib/validation/parse";

/**
 * GET /api/admin/projects
 * Get projects for admin review queue
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
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

        const parsedQuery = parseQuery(request, adminProjectsQuerySchema);
        if (!parsedQuery.success) {
            return NextResponse.json(parsedQuery.error, { status: 400 });
        }

        const { status, page, limit } = parsedQuery.data;
        const offset = (page - 1) * limit;

        const where: Record<string, unknown> = { source: "INTERNAL" };
        if (status) where.status = status;

        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                where,
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                    skills: {
                        include: { skill: true },
                        take: 3,
                    },
                    _count: {
                        select: { applications: true },
                    },
                },
                orderBy: [
                    { status: "asc" }, // PENDING first
                    { createdAt: "desc" },
                ],
                skip: offset,
                take: limit,
            }),
            prisma.project.count({ where }),
        ]);

        return NextResponse.json({
            projects,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("[API] Admin projects error:", error);
        return NextResponse.json(
            { error: "Failed to fetch projects" },
            { status: 500 }
        );
    }
}
