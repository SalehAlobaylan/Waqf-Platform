import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { adminFeaturedUpdateSchema } from "@/lib/validation/schemas";
import { parseBody } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";

/**
 * GET /api/admin/featured
 * List currently featured projects
 */
export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const featured = await prisma.project.findMany({
            where: { featured: true },
            select: {
                id: true,
                title: true,
                slug: true,
                category: true,
                featured: true,
                featuredUntil: true,
                owner: { select: { id: true, name: true } },
            },
            orderBy: { featuredUntil: "desc" },
        });

        return NextResponse.json({ projects: featured });
    } catch (error) {
        console.error("[API] Get featured error:", error);
        return NextResponse.json({ error: "Failed to fetch featured" }, { status: 500 });
    }
}

/**
 * PUT /api/admin/featured
 * Update featured status of a project
 */
export async function PUT(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const parsedBody = await parseBody(request, adminFeaturedUpdateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const { projectId, featured, featuredUntil } = parsedBody.data;

        const existing = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
        if (!existing) {
            return NextResponse.json(
                makeValidationError("Project not found", "projectId"),
                { status: 404 }
            );
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
    } catch (error) {
        console.error("[API] Update featured error:", error);
        return NextResponse.json({ error: "Failed to update featured" }, { status: 500 });
    }
}
