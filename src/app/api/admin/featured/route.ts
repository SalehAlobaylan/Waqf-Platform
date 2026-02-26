import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

        const body = await request.json();
        const { projectId, featured, featuredUntil } = body;

        if (!projectId) {
            return NextResponse.json({ error: "projectId is required" }, { status: 400 });
        }

        const project = await prisma.project.update({
            where: { id: projectId },
            data: {
                featured: !!featured,
                featuredUntil: featuredUntil ? new Date(featuredUntil) : null,
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
