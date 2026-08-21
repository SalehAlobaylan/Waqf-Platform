import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { messagesQuerySchema, messageCreateSchema } from "@/lib/validation/schemas";
import { parseBody, parseQuery } from "@/lib/validation/parse";
import { makeNotFoundError } from "@/lib/validation/errors";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { pusherServer, getApplicationChannel, PUSHER_EVENTS } from "@/lib/pusher";
import { sendEventEmail } from "@/lib/event-email";
import { log } from "@/lib/logger";

/**
 * GET /api/messages
 * List messages for a conversation (application)
 */
export async function GET(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.messages.list", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

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
            return NextResponse.json(makeNotFoundError("Application not found", "applicationId"), { status: 404 });
        }

        const isContributor = application.contributorId === user.id;
        const isOwner = application.project.ownerId === user.id;

        if (!isContributor && !isOwner) {
            return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
        }

        // Fetch only the most recent `limit` messages (bounded history),
        // returned oldest-first for rendering.
        const recent = await prisma.message.findMany({
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
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            take: parsedQuery.data.limit,
        });
        const messages = recent.reverse();

        // Mark unread messages as read
        await prisma.message.updateMany({
            where: {
                applicationId,
                senderId: { not: user.id },
                readAt: null,
            },
            data: {
                readAt: new Date(),
            },
        });

        return NextResponse.json({ messages });
    }, ctx);
}

/**
 * POST /api/messages
 * Send a new message
 */
export async function POST(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.messages.create", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const rate = checkRateLimit(request, "message-create", { limit: 30, windowMs: 60_000 }, user.id);
        if (!rate.allowed) {
            return rateLimitedResponse(rate);
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
            return NextResponse.json(makeNotFoundError("Application not found", "applicationId"), { status: 404 });
        }

        const isContributor = application.contributorId === user.id;
        const isOwner = application.project.ownerId === user.id;

        if (!isContributor && !isOwner) {
            return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
        }

        // Create message (authoritative write)
        const message = await prisma.message.create({
            data: {
                applicationId,
                senderId: user.id,
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

        // Best-effort side effects: the message is already saved, so a
        // notification/email/pusher failure must not fail the request.
        const recipientId = isContributor
            ? application.project.ownerId
            : application.contributorId;

        try {
            if (recipientId) {
                await prisma.notification.create({
                    data: {
                        userId: recipientId,
                        type: "NEW_MESSAGE",
                        title: "New Message",
                        content: `${user.name}: ${content.trim().slice(0, 50)}${content.trim().length > 50 ? "..." : ""}`,
                        link: `/dashboard/applications/${applicationId}`,
                    },
                });

                await sendEventEmail(recipientId, {
                    kind: "NEW_MESSAGE",
                    actorName: user.name ?? undefined,
                    projectTitle: application.project.title,
                    applicationId,
                    messagePreview: content.trim().slice(0, 140),
                });
            }

            // Trigger Pusher event for real-time updates. Awaited and caught —
            // an unhandled rejected promise would otherwise crash/leak.
            const pusher = pusherServer();
            if (pusher) {
                await pusher.trigger(
                    getApplicationChannel(applicationId),
                    PUSHER_EVENTS.NEW_MESSAGE,
                    message
                );
            }
        } catch (err) {
            log.warn("api.messages.create", "post-commit side effects failed", {
                applicationId,
            }, err);
        }

        return NextResponse.json({ message }, { status: 201 });
    }, ctx);
}
