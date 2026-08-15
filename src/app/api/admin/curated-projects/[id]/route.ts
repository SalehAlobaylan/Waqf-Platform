import { NextRequest, NextResponse } from "next/server";
import { ProjectStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { projectCurateUpdateSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { makeNotFoundError } from "@/lib/validation/errors";
import { assertSkillsExist } from "@/lib/validation/skills";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/curated-projects/[id]
 * Fetch a single admin-curated external project
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.admin.curatedProjects.get", async () => {
        const admin = await requireAdminOrThrow();
        ctx.userId = admin.id;

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
            return NextResponse.json(makeNotFoundError("Curated project not found", "id"), { status: 404 });
        }

        return NextResponse.json(project);
    }, ctx);
}

/**
 * PATCH /api/admin/curated-projects/[id]
 * Update a curated project
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.admin.curatedProjects.update", async () => {
        const admin = await requireAdminOrThrow();
        ctx.userId = admin.id;

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
            return NextResponse.json(makeNotFoundError("Curated project not found", "id"), { status: 404 });
        }

        const { skills, status, ...rest } = parsedBody.data;

        if (skills?.length) {
            const skillError = await assertSkillsExist(skills.map((s) => s.skillId));
            if (skillError) {
                return NextResponse.json(skillError, { status: 400 });
            }
        }

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
    }, ctx);
}

/**
 * DELETE /api/admin/curated-projects/[id]
 * Delete a curated project
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.admin.curatedProjects.delete", async () => {
        const admin = await requireAdminOrThrow();
        ctx.userId = admin.id;

        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }

        const existing = await prisma.project.findUnique({
            where: { id: parsedParams.data.id },
            select: { id: true, source: true },
        });
        if (!existing || existing.source !== "EXTERNAL") {
            return NextResponse.json(makeNotFoundError("Curated project not found", "id"), { status: 404 });
        }

        await prisma.project.delete({ where: { id: parsedParams.data.id } });
        return NextResponse.json({ success: true });
    }, ctx);
}
