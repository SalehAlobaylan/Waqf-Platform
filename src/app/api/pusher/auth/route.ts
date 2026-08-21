import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { pusherServer } from "@/lib/pusher";

const APPLICATION_CHANNEL_PREFIX = "private-application-";
const USER_CHANNEL_PREFIX = "private-user-";

/**
 * POST /api/pusher/auth
 * Pusher private-channel subscription authorization. pusher-js posts
 * `socket_id` + `channel_name` here; we verify the session user is a
 * participant of the requested channel before signing.
 */
export async function POST(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.pusher.auth", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const pusher = pusherServer();
        if (!pusher) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const form = await request.formData();
        const socketId = form.get("socket_id");
        const channelName = form.get("channel_name");

        if (typeof socketId !== "string" || typeof channelName !== "string") {
            return NextResponse.json({ error: "Bad request" }, { status: 400 });
        }

        let authorized: { auth: string };
        if (channelName.startsWith(APPLICATION_CHANNEL_PREFIX)) {
            const applicationId = channelName.slice(APPLICATION_CHANNEL_PREFIX.length);
            const application = await prisma.application.findUnique({
                where: { id: applicationId },
                select: {
                    contributorId: true,
                    project: { select: { ownerId: true } },
                },
            });
            const isContributor = application?.contributorId === user.id;
            const isOwner = application?.project.ownerId === user.id;
            if (!application || (!isContributor && !isOwner)) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
            authorized = pusher.authorizeChannel(socketId, channelName);
        } else if (channelName.startsWith(USER_CHANNEL_PREFIX)) {
            const channelUserId = channelName.slice(USER_CHANNEL_PREFIX.length);
            if (channelUserId !== user.id) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
            authorized = pusher.authorizeChannel(socketId, channelName);
        } else {
            // Only known private-channel families may be authorized.
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(authorized);
    }, ctx);
}
