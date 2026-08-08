import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { ProjectStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { projectCurateUpdateSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";

interface RouteParams {
    params: Promise<{ id: string }>;
}

async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
        return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });
    if (user?.role !== "ADMIN") {
        return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
    return { session };
}

/**
 * GET /api/admin/curated-projects/[id]
 * Fetch a single admin-curated external project
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requireAdmin();
        if ("error" in authResult) return authResult.error;

        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }

        const project = await prisma.project.findUnique({
            where: { id: parsedParams.data.id },
            include: {
                addedByAdmin: { select: { id: true, name: true, email: true } },
                skills: { include: { skill: true } },
            },
        });

        if (!project || project.source !== "EXTERNAL") {
            return NextResponse.json(
                makeValidationError("Curated project not found", "id"),
                { status: 404 }
            );
        }

        return NextResponse.json(project);
    } catch (error) {
        console.error("[API] Curated project fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch curated project" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/admin/curated-projects/[id]
 * Update a curated project
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requireAdmin();
        if ("error" in authResult) return authResult.error;

        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }

        const parsedBody = await parseBody(request, projectCurateUpdateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const existing = await prisma.project.findUnique({
            where: { id: parsedParams.data.id },
            select: { id: true, source: true },
        });
        if (!existing || existing.source !== "EXTERNAL") {
            return NextResponse.json(
                makeValidationError("Curated project not found", "id"),
                { status: 404 }
            );
        }

        const { skills, status, ...rest } = parsedBody.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = { ...rest };
        if (status) data.status = status as ProjectStatus;
        if (skills) {
            data.skills = {
                deleteMany: {},
                create: skills.map((s) => ({
                    skillId: s.skillId,
                    isRequired: s.isRequired ?? false,
                })),
            };
        }

        const updated = await prisma.project.update({
            where: { id: parsedParams.data.id },
            data,
            include: {
                addedByAdmin: { select: { id: true, name: true, email: true } },
                skills: { include: { skill: true } },
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[API] Curated project update error:", error);
        return NextResponse.json(
            { error: "Failed to update curated project" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/curated-projects/[id]
 * Delete a curated project
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requireAdmin();
        if ("error" in authResult) return authResult.error;

        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }

        const existing = await prisma.project.findUnique({
            where: { id: parsedParams.data.id },
            select: { id: true, source: true },
        });
        if (!existing || existing.source !== "EXTERNAL") {
            return NextResponse.json(
                makeValidationError("Curated project not found", "id"),
                { status: 404 }
            );
        }

        await prisma.project.delete({ where: { id: parsedParams.data.id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[API] Curated project delete error:", error);
        return NextResponse.json(
            { error: "Failed to delete curated project" },
            { status: 500 }
        );
    }
}
