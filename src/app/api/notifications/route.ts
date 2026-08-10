import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { notificationPatchSchema, notificationsQuerySchema } from "@/lib/validation/schemas";
import { parseBody, parseQuery } from "@/lib/validation/parse";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

/**
 * GET /api/notifications
 * List user's notifications
 */
export async function GET(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.notifications.list", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const parsedQuery = parseQuery(request, notificationsQuerySchema);
        if (!parsedQuery.success) {
            return NextResponse.json(parsedQuery.error, { status: 400 });
        }

        const { unread, limit } = parsedQuery.data;
        const unreadOnly = unread === "true";

        const notifications = await prisma.notification.findMany({
            where: {
                userId: user.id,
                ...(unreadOnly && { read: false }),
            },
            orderBy: {
                createdAt: "desc",
            },
            take: limit,
        });

        // Get unread count
        const unreadCount = await prisma.notification.count({
            where: {
                userId: user.id,
                read: false,
            },
        });

        return NextResponse.json({
            notifications,
            unreadCount,
        });
    }, ctx);
}

/**
 * PATCH /api/notifications
 * Mark notifications as read
 */
export async function PATCH(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.notifications.markRead", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const rate = checkRateLimit(request, "notification-patch", { limit: 30, windowMs: 60_000 }, user.id);
        if (!rate.allowed) {
            return rateLimitedResponse(rate);
        }

        const parsedBody = await parseBody(request, notificationPatchSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const { notificationIds, markAllRead } = parsedBody.data;

        if (markAllRead) {
            await prisma.notification.updateMany({
                where: {
                    userId: user.id,
                    read: false,
                },
                data: {
                    read: true,
                },
            });
        } else if (notificationIds?.length) {
            await prisma.notification.updateMany({
                where: {
                    id: { in: notificationIds },
                    userId: user.id,
                },
                data: {
                    read: true,
                },
            });
        }

        return NextResponse.json({ success: true });
    }, ctx);
}
