import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { adminFeaturedUpdateSchema } from "@/lib/validation/schemas";
import { parseBody } from "@/lib/validation/parse";
import { makeNotFoundError } from "@/lib/validation/errors";

/**
 * GET /api/admin/featured
 * List currently featured projects
 */
export async function GET(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.admin.featured.list", async () => {
        const admin = await requireAdminOrThrow();
        ctx.userId = admin.id;

        const featured = await prisma.project.findMany({
            where: { featured: true },
            select: {
                id: true,
                title: true,
                slug: true,
                category: true,
                featured: true,
                featuredUntil: true,
                source: true,
                owner: { select: { id: true, name: true } },
            },
            orderBy: { featuredUntil: "desc" },
        });

        return NextResponse.json({ projects: featured });
    }, ctx);
}

/**
 * PUT /api/admin/featured
 * Update featured status of a project
 */
export async function PUT(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.admin.featured.update", async () => {
        const admin = await requireAdminOrThrow();
        ctx.userId = admin.id;

        const parsedBody = await parseBody(request, adminFeaturedUpdateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const { projectId, featured, featuredUntil } = parsedBody.data;

        const existing = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
        if (!existing) {
            return NextResponse.json(makeNotFoundError("Project not found", "projectId"), { status: 404 });
        }

        const project = await prisma.project.update({
            where: { id: projectId },
            data: {
                featured: !!featured,
                featuredUntil: featuredUntil ?? null,
            },
            select: {
                id: true,
                title: true,
                slug: true,
                featured: true,
                featuredUntil: true,
            },
        });

        return NextResponse.json({ project });
    }, ctx);
}
