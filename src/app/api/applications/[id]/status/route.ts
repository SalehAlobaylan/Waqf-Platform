import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ApplicationStatus } from "@prisma/client";
import { applicationStatusUpdateSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";
import { sendEventEmail } from "@/lib/event-email";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * PATCH /api/applications/[id]/status
 * Accept or reject an application (project owner only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }

        const parsedBody = await parseBody(request, applicationStatusUpdateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const { id } = parsedParams.data;
        const { status, feedback } = parsedBody.data;

        // Get application with project
        const application = await prisma.application.findUnique({
            where: { id },
            include: {
                project: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        ownerId: true,
                    },
                },
                contributor: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!application) {
            return NextResponse.json(
                makeValidationError("Application not found", "id"),
                { status: 404 }
            );
        }

        // External/curated projects have no on-platform owner to manage applications
        if (!application.project.ownerId) {
            return NextResponse.json(
                { error: "External curated projects do not accept on-platform applications" },
                { status: 400 }
            );
        }

        // Only project owner can update status
        if (application.project.ownerId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Can only update pending applications
        if (application.status !== "PENDING") {
            return NextResponse.json(
                makeValidationError("Application has already been processed", "status"),
                { status: 400 }
            );
        }

        // Update application status
        const updatedApplication = await prisma.application.update({
            where: { id },
            data: {
                status: status as ApplicationStatus,
            },
        });

        // Create notification for contributor
        await prisma.notification.create({
            data: {
                userId: application.contributorId,
                type: status === "ACCEPTED" ? "APPLICATION_ACCEPTED" : "APPLICATION_REJECTED",
                title: status === "ACCEPTED" 
                    ? "Application Accepted! 🎉" 
                    : "Application Update",
                content: status === "ACCEPTED"
                    ? `Your application to "${application.project.title}" has been accepted!`
                    : feedback?.trim() || `Your application to "${application.project.title}" was not accepted this time.`,
                link: `/dashboard/applications`,
            },
        });

        // Event email to the contributor
        await sendEventEmail(application.contributorId, {
            kind: status === "ACCEPTED" ? "APPLICATION_ACCEPTED" : "APPLICATION_REJECTED",
            actorName: session.user.name ?? undefined,
            projectTitle: application.project.title,
            projectSlug: application.project.slug,
            applicationId: application.id,
            feedback: feedback?.trim() || undefined,
        });

        // If accepted, optionally update project status to IN_PROGRESS
        if (status === "ACCEPTED") {
            await prisma.project.update({
                where: { id: application.projectId },
                data: { status: "IN_PROGRESS" },
            });
        }

        return NextResponse.json({ application: updatedApplication });
    } catch (error) {
        console.error("[API] Update application status error:", error);
        return NextResponse.json(
            { error: "Failed to update application status" },
            { status: 500 }
        );
    }
}
