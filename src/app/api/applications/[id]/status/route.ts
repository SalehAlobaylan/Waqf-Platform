import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ApplicationStatus } from "@prisma/client";

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

        const { id } = await params;
        const body = await request.json();
        const { status, feedback } = body;

        // Validate status
        if (!status || !["ACCEPTED", "REJECTED"].includes(status)) {
            return NextResponse.json(
                { error: "Invalid status. Must be ACCEPTED or REJECTED" },
                { status: 400 }
            );
        }

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
                { error: "Application not found" },
                { status: 404 }
            );
        }

        // Only project owner can update status
        if (application.project.ownerId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Can only update pending applications
        if (application.status !== "PENDING") {
            return NextResponse.json(
                { error: "Application has already been processed" },
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
                    : `Your application to "${application.project.title}" was not accepted this time.`,
                link: `/dashboard/applications`,
            },
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
