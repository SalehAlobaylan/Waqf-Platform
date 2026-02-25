import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * PATCH /api/messages/[id]/read
 * Mark a message as read
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const message = await prisma.message.findUnique({
            where: { id },
            include: {
                application: {
                    select: {
                        contributorId: true,
                        project: {
                            select: {
                                ownerId: true,
                            },
                        },
                    },
                },
            },
        });

        if (!message) {
            return NextResponse.json(
                { error: "Message not found" },
                { status: 404 }
            );
        }

        // Only recipient can mark as read
        const isContributor = message.application.contributorId === session.user.id;
        const isOwner = message.application.project.ownerId === session.user.id;

        if (!isContributor && !isOwner) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Can't mark own messages as read
        if (message.senderId === session.user.id) {
            return NextResponse.json(
                { error: "Cannot mark own message as read" },
                { status: 400 }
            );
        }

        // Update message
        const updatedMessage = await prisma.message.update({
            where: { id },
            data: { readAt: new Date() },
        });

        return NextResponse.json({ message: updatedMessage });
    } catch (error) {
        console.error("[API] Mark message read error:", error);
        return NextResponse.json(
            { error: "Failed to mark message as read" },
            { status: 500 }
        );
    }
}
