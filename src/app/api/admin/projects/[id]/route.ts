import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { adminProjectActionSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/projects/[id]
 * Approve or reject a project
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
            return NextResponse.json(
                makeValidationError("Project not found", "id"),
                { status: 404 }
            );
        }

        const updateData: Record<string, unknown> = {};

        if (action === "approve") {
            updateData.status = "OPEN";
        } else if (action === "reject") {
            updateData.status = "CANCELLED";
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

        // Create notification for project owner
        if (action === "approve" || action === "reject") {
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
    } catch (error) {
        console.error("[API] Admin project action error:", error);
        return NextResponse.json(
            { error: "Failed to update project" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/projects/[id]
 * Delete a project (admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }

        const { id } = parsedParams.data;

        const project = await prisma.project.findUnique({ where: { id }, select: { id: true } });
        if (!project) {
            return NextResponse.json(
                makeValidationError("Project not found", "id"),
                { status: 404 }
            );
        }

        await prisma.project.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[API] Admin delete project error:", error);
        return NextResponse.json(
            { error: "Failed to delete project" },
            { status: 500 }
        );
    }
}
