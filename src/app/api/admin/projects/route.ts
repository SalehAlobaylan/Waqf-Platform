import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { adminProjectsQuerySchema } from "@/lib/validation/schemas";
import { parseQuery } from "@/lib/validation/parse";

/**
 * GET /api/admin/projects
 * Get projects for admin review queue
 */
export async function GET(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.admin.projects.list", async () => {
        const admin = await requireAdminOrThrow();
        ctx.userId = admin.id;

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
    }, ctx);
}
