import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { campaignMilestoneCreateSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { makeNotFoundError } from "@/lib/validation/errors";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.campaigns.milestones.create", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }
        const parsedBody = await parseBody(request, campaignMilestoneCreateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }
        const { id } = parsedParams.data;
        const data = parsedBody.data;

        const campaign = await prisma.campaign.findUnique({
            where: { id },
            select: { ownerId: true, status: true },
        });
        if (!campaign) {
            return NextResponse.json(makeNotFoundError("Campaign not found", "id"), { status: 404 });
        }
        if (campaign.ownerId !== user.id) {
            return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
        }

        const existing = await prisma.campaignMilestone.count({ where: { campaignId: id } });
        const order = data.order ?? existing;

        const milestone = await prisma.campaignMilestone.create({
            data: {
                campaignId: id,
                title: data.title,
                description: data.description ?? null,
                order,
            },
        });
        return NextResponse.json(milestone, { status: 201 });
    }, ctx);
}
