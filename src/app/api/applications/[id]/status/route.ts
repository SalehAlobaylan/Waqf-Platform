import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { ApplicationStatus } from "@prisma/client";
import { applicationStatusUpdateSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { makeNotFoundError, makeValidationError } from "@/lib/validation/errors";
import { sendEventEmail } from "@/lib/event-email";
import { log } from "@/lib/logger";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * PATCH /api/applications/[id]/status
 * Accept or reject an application (project owner only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.applications.updateStatus", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

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
            return NextResponse.json(makeNotFoundError("Application not found", "id"), { status: 404 });
        }

        // External/curated projects have no on-platform owner to manage applications
        if (!application.project.ownerId) {
            return NextResponse.json(
                { error: "External curated projects do not accept on-platform applications", code: "VALIDATION_FAILED" },
                { status: 400 }
            );
        }

        // Only project owner can update status
        if (application.project.ownerId !== user.id) {
            return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
        }

        // Can only update pending applications
        if (application.status !== "PENDING") {
            return NextResponse.json(
                makeValidationError("Application has already been processed", "status"),
                { status: 400 }
            );
        }

        // Update application status (authoritative write)
        const updatedApplication = await prisma.application.update({
            where: { id },
            data: {
                status: status as ApplicationStatus,
            },
        });

        // Best-effort side effects: the status is already committed. A
        // notification/email failure must not fail the request, and the
        // IN_PROGRESS project update still runs.
        try {
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

            await sendEventEmail(application.contributorId, {
                kind: status === "ACCEPTED" ? "APPLICATION_ACCEPTED" : "APPLICATION_REJECTED",
                actorName: user.name ?? undefined,
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
        } catch (err) {
            log.warn("api.applications.updateStatus", "post-commit side effects failed", {
                applicationId: id,
            }, err);
        }

        return NextResponse.json({ application: updatedApplication });
    }, ctx);
}
