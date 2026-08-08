import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { campaignMilestoneUpdateSchema, idSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";

interface RouteParams {
    params: Promise<{ id: string; milestoneId: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        const parsedParams = parseParams(
            await params,
            routeIdParamSchema.extend({ milestoneId: idSchema })
        );
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }
        const parsedBody = await parseBody(request, campaignMilestoneUpdateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }
        const { id, milestoneId } = parsedParams.data;
        const data = parsedBody.data;

        const milestone = await prisma.campaignMilestone.findUnique({
            where: { id: milestoneId },
            include: { campaign: { select: { ownerId: true } } },
        });
        if (!milestone || milestone.campaignId !== id) {
            return NextResponse.json(
                makeValidationError("Milestone not found", "milestoneId"),
                { status: 404 }
            );
        }
        if (milestone.campaign.ownerId !== session.user.id) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }

        const updated = await prisma.campaignMilestone.update({
            where: { id: milestoneId },
            data: {
                ...(data.title !== undefined && { title: data.title }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.order !== undefined && { order: data.order }),
                ...(data.isDone !== undefined && {
                    isDone: data.isDone,
                    doneAt: data.isDone ? new Date() : null,
                }),
            },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error("[API] Error updating milestone:", error);
        return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        const parsedParams = parseParams(
            await params,
            routeIdParamSchema.extend({ milestoneId: idSchema })
        );
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }
        const { id, milestoneId } = parsedParams.data;

        const milestone = await prisma.campaignMilestone.findUnique({
            where: { id: milestoneId },
            include: { campaign: { select: { ownerId: true } } },
        });
        if (!milestone || milestone.campaignId !== id) {
            return NextResponse.json(
                makeValidationError("Milestone not found", "milestoneId"),
                { status: 404 }
            );
        }
        if (milestone.campaign.ownerId !== session.user.id) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }
        await prisma.campaignMilestone.delete({ where: { id: milestoneId } });
        return NextResponse.json({ message: "Milestone deleted" });
    } catch (error) {
        console.error("[API] Error deleting milestone:", error);
        return NextResponse.json({ error: "Failed to delete milestone" }, { status: 500 });
    }
}
