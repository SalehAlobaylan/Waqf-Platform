import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { campaignMilestoneCreateSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
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
            return NextResponse.json(
                makeValidationError("Campaign not found", "id"),
                { status: 404 }
            );
        }
        if (campaign.ownerId !== session.user.id) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
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
    } catch (error) {
        console.error("[API] Error creating milestone:", error);
        return NextResponse.json({ error: "Failed to create milestone" }, { status: 500 });
    }
}
