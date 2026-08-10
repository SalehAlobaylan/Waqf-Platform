import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { campaignMilestoneUpdateSchema, idSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { makeNotFoundError } from "@/lib/validation/errors";

interface RouteParams {
    params: Promise<{ id: string; milestoneId: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.campaigns.milestones.update", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

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
            return NextResponse.json(makeNotFoundError("Milestone not found", "milestoneId"), { status: 404 });
        }
        if (milestone.campaign.ownerId !== user.id) {
            return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
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
    }, ctx);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.campaigns.milestones.delete", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

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
            return NextResponse.json(makeNotFoundError("Milestone not found", "milestoneId"), { status: 404 });
        }
        if (milestone.campaign.ownerId !== user.id) {
            return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
        }
        await prisma.campaignMilestone.delete({ where: { id: milestoneId } });
        return NextResponse.json({ message: "Milestone deleted" });
    }, ctx);
}
