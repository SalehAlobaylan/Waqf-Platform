import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { campaignJoinUpdateSchema, idSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";
import { acceptJoin, rejectJoin, withdrawJoin } from "@/lib/campaigns/joins";
import { notifyContributorJoinDecision } from "@/lib/campaigns/notifications";

interface RouteParams {
    params: Promise<{ id: string; joinId: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        const parsedParams = parseParams(await params, routeIdParamSchema.extend({ joinId: idSchema }));
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }
        const parsedBody = await parseBody(request, campaignJoinUpdateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }
        const { id, joinId } = parsedParams.data;
        const { status } = parsedBody.data;

        const join = await prisma.campaignJoin.findUnique({
            where: { id: joinId },
            include: {
                campaign: { select: { id: true, slug: true, title: true, ownerId: true, status: true } },
                role: { select: { title: true } },
                contributor: { select: { id: true, name: true } },
            },
        });
        if (!join || join.campaignId !== id) {
            return NextResponse.json(
                makeValidationError("Join not found", "joinId"),
                { status: 404 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });
        const isAdmin = user?.role === "ADMIN";
        const isOwner = join.campaign.ownerId === session.user.id;
        const isSelf = join.contributorId === session.user.id;

        if (status === "WITHDRAWN") {
            if (!isSelf) {
                return NextResponse.json({ error: "Not authorized" }, { status: 403 });
            }
            await withdrawJoin(joinId, session.user.id);
            const updated = await prisma.campaignJoin.findUnique({
                where: { id: joinId },
                include: { role: { include: { skill: true } } },
            });
            return NextResponse.json(updated);
        }

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }

        try {
            if (status === "ACCEPTED") {
                await acceptJoin(joinId);
            } else if (status === "REJECTED") {
                await rejectJoin(joinId);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Action failed";
            return NextResponse.json(
                { error: "Validation failed", details: [{ path: "status", message }] },
                { status: 400 }
            );
        }

        try {
            await notifyContributorJoinDecision({
                contributorId: join.contributorId,
                accepted: status === "ACCEPTED",
                campaignSlug: join.campaign.slug,
                campaignTitle: join.campaign.title,
                roleTitle: join.role.title,
            });
        } catch (err) {
            console.error("[campaigns/joins] decision notification failed", err);
        }

        const updated = await prisma.campaignJoin.findUnique({
            where: { id: joinId },
            include: { role: { include: { skill: true } } },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error("[API] Error updating campaign join:", error);
        return NextResponse.json({ error: "Failed to update join" }, { status: 500 });
    }
}
