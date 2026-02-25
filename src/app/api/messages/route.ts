import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * GET /api/messages
 * List messages for a conversation (application)
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const applicationId = searchParams.get("applicationId");

        if (!applicationId) {
            return NextResponse.json(
                { error: "Application ID is required" },
                { status: 400 }
            );
        }

        // Verify user has access to this application
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            select: {
                contributorId: true,
                project: {
                    select: {
                        ownerId: true,
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

        const isContributor = application.contributorId === session.user.id;
        const isOwner = application.project.ownerId === session.user.id;

        if (!isContributor && !isOwner) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Fetch messages
        const messages = await prisma.message.findMany({
            where: { applicationId },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        // Mark unread messages as read
        await prisma.message.updateMany({
            where: {
                applicationId,
                senderId: { not: session.user.id },
                readAt: null,
            },
            data: {
                readAt: new Date(),
            },
        });

        return NextResponse.json({ messages });
    } catch (error) {
        console.error("[API] Get messages error:", error);
        return NextResponse.json(
            { error: "Failed to fetch messages" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/messages
 * Send a new message
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { applicationId, content } = body;

        if (!applicationId || !content?.trim()) {
            return NextResponse.json(
                { error: "Application ID and content are required" },
                { status: 400 }
            );
        }

        // Verify user has access
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            select: {
                id: true,
                contributorId: true,
                project: {
                    select: {
                        ownerId: true,
                        title: true,
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

        const isContributor = application.contributorId === session.user.id;
        const isOwner = application.project.ownerId === session.user.id;

        if (!isContributor && !isOwner) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                applicationId,
                senderId: session.user.id,
                content: content.trim(),
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        // Create notification for recipient
        const recipientId = isContributor 
            ? application.project.ownerId 
            : application.contributorId;

        await prisma.notification.create({
            data: {
                userId: recipientId,
                type: "NEW_MESSAGE",
                title: "New Message",
                content: `${session.user.name}: ${content.slice(0, 50)}${content.length > 50 ? "..." : ""}`,
                link: `/dashboard/applications/${applicationId}`,
            },
        });

        // TODO: Trigger Pusher event for real-time updates
        // pusherServer.trigger(getApplicationChannel(applicationId), PUSHER_EVENTS.NEW_MESSAGE, message);

        return NextResponse.json({ message }, { status: 201 });
    } catch (error) {
        console.error("[API] Send message error:", error);
        return NextResponse.json(
            { error: "Failed to send message" },
            { status: 500 }
        );
    }
}
