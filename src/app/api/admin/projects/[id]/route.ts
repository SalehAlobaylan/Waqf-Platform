import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { adminProjectActionSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { makeNotFoundError, makeValidationError } from "@/lib/validation/errors";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/projects/[id]
 * Approve or reject a project
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.admin.projects.action", async () => {
        const admin = await requireAdminOrThrow();
        ctx.userId = admin.id;

        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }

        const parsedBody = await parseBody(request, adminProjectActionSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const { action, feedback, featured } = parsedBody.data;
        const { id } = parsedParams.data;

        // Get the project
        const project = await prisma.project.findUnique({
            where: { id },
            include: { owner: true },
        });

        if (!project) {
            return NextResponse.json(makeNotFoundError("Project not found", "id"), { status: 404 });
        }

        const updateData: Record<string, unknown> = {};

        if (action === "approve") {
            updateData.status = "OPEN";
            updateData.adminFeedback = null;
        } else if (action === "reject") {
            updateData.status = "DRAFT";
            updateData.adminFeedback = feedback || null;
        } else if (action === "feature") {
            updateData.featured = true;
        } else if (action === "unfeature") {
            updateData.featured = false;
        } else if (typeof featured === "boolean") {
            updateData.featured = featured;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                makeValidationError("No changes requested", "action"),
                { status: 400 }
            );
        }

        // Update project
        const updatedProject = await prisma.project.update({
            where: { id },
            data: updateData,
        });

        // Create notification for project owner (skip for ownerless external projects)
        if ((action === "approve" || action === "reject") && project.ownerId) {
            await prisma.notification.create({
                data: {
                    userId: project.ownerId,
                    type: action === "approve" ? "PROJECT_APPROVED" : "PROJECT_REJECTED",
                    title: action === "approve" ? "Project Approved" : "Project Rejected",
                    content: feedback || (action === "approve"
                        ? "Your project has been approved and is now visible to contributors."
                        : "Your project was not approved. Please review the feedback and resubmit."),
                    link: `/projects/${project.slug}`,
                },
            });
        }

        return NextResponse.json({
            success: true,
            project: updatedProject
        });
    }, ctx);
}

/**
 * DELETE /api/admin/projects/[id]
 * Delete a project (admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.admin.projects.delete", async () => {
        const admin = await requireAdminOrThrow();
        ctx.userId = admin.id;

        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }

        const { id } = parsedParams.data;

        const project = await prisma.project.findUnique({ where: { id }, select: { id: true } });
        if (!project) {
            return NextResponse.json(makeNotFoundError("Project not found", "id"), { status: 404 });
        }

        await prisma.project.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    }, ctx);
}
