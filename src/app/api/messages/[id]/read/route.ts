import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { routeIdParamSchema } from "@/lib/validation/schemas";
import { parseParams } from "@/lib/validation/parse";
import { makeNotFoundError, makeValidationError } from "@/lib/validation/errors";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * PATCH /api/messages/[id]/read
 * Mark a message as read
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.messages.markRead", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const rate = checkRateLimit(request, "message-read", { limit: 60, windowMs: 60_000 }, user.id);
        if (!rate.allowed) {
            return rateLimitedResponse(rate);
        }

        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }

        const { id } = parsedParams.data;

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
            return NextResponse.json(makeNotFoundError("Message not found", "id"), { status: 404 });
        }

        // Only recipient can mark as read
        const isContributor = message.application.contributorId === user.id;
        const isOwner = message.application.project.ownerId === user.id;

        if (!isContributor && !isOwner) {
            return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
        }

        // Can't mark own messages as read
        if (message.senderId === user.id) {
            return NextResponse.json(
                makeValidationError("Cannot mark own message as read", "id"),
                { status: 400 }
            );
        }

        // Update message
        const updatedMessage = await prisma.message.update({
            where: { id },
            data: { readAt: new Date() },
        });

        return NextResponse.json({ message: updatedMessage });
    }, ctx);
}
