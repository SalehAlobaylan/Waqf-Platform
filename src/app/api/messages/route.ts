import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { messagesQuerySchema, messageCreateSchema } from "@/lib/validation/schemas";
import { parseBody, parseQuery } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { pusherServer, getApplicationChannel, PUSHER_EVENTS } from "@/lib/pusher";
import { sendEventEmail } from "@/lib/event-email";

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

        const parsedQuery = parseQuery(request, messagesQuerySchema);
        if (!parsedQuery.success) {
            return NextResponse.json(parsedQuery.error, { status: 400 });
        }

        const { applicationId } = parsedQuery.data;

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
                makeValidationError("Application not found", "applicationId"),
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

        if (!checkRateLimit(request, "message-create", { limit: 30, windowMs: 60_000 }, session.user.id)) {
            return rateLimitedResponse();
        }

        const parsedBody = await parseBody(request, messageCreateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const { applicationId, content } = parsedBody.data;

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
                makeValidationError("Application not found", "applicationId"),
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

        // Create notification for recipient (skip if owner is absent, e.g. external project)
        const recipientId = isContributor
            ? application.project.ownerId
            : application.contributorId;

        if (recipientId) {
            await prisma.notification.create({
                data: {
                    userId: recipientId,
                    type: "NEW_MESSAGE",
                    title: "New Message",
                    content: `${session.user.name}: ${content.trim().slice(0, 50)}${content.trim().length > 50 ? "..." : ""}`,
                    link: `/dashboard/applications/${applicationId}`,
                },
            });

            // Event email to the recipient
            await sendEventEmail(recipientId, {
                kind: "NEW_MESSAGE",
                actorName: session.user.name ?? undefined,
                projectTitle: application.project.title,
                applicationId,
                messagePreview: content.trim().slice(0, 140),
            });
        }

        // Trigger Pusher event for real-time updates
        const pusher = pusherServer();
        if (pusher) {
            pusher.trigger(
                getApplicationChannel(applicationId),
                PUSHER_EVENTS.NEW_MESSAGE,
                message
            );
        }

        return NextResponse.json({ message }, { status: 201 });
    } catch (error) {
        console.error("[API] Send message error:", error);
        return NextResponse.json(
            { error: "Failed to send message" },
            { status: 500 }
        );
    }
}
