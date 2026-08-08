import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notificationPatchSchema, notificationsQuerySchema } from "@/lib/validation/schemas";
import { parseBody, parseQuery } from "@/lib/validation/parse";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

/**
 * GET /api/notifications
 * List user's notifications
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const parsedQuery = parseQuery(request, notificationsQuerySchema);
        if (!parsedQuery.success) {
            return NextResponse.json(parsedQuery.error, { status: 400 });
        }

        const { unread, limit } = parsedQuery.data;
        const unreadOnly = unread === "true";

        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id,
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
                userId: session.user.id,
                read: false,
            },
        });

        return NextResponse.json({
            notifications,
            unreadCount,
        });
    } catch (error) {
        console.error("[API] Get notifications error:", error);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/notifications
 * Mark notifications as read
 */
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!checkRateLimit(request, "notification-patch", { limit: 30, windowMs: 60_000 }, session.user.id)) {
            return rateLimitedResponse();
        }

        const parsedBody = await parseBody(request, notificationPatchSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const { notificationIds, markAllRead } = parsedBody.data;

        if (markAllRead) {
            await prisma.notification.updateMany({
                where: {
                    userId: session.user.id,
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
                    userId: session.user.id,
                },
                data: {
                    read: true,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[API] Mark read error:", error);
        return NextResponse.json(
            { error: "Failed to mark notifications as read" },
            { status: 500 }
        );
    }
}
