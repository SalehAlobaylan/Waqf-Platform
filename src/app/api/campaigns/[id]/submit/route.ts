import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CampaignStatus } from "@prisma/client";
import { routeIdParamSchema } from "@/lib/validation/schemas";
import { parseParams } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }
        const { id } = parsedParams.data;

        const existing = await prisma.campaign.findUnique({
            where: { id },
            include: { _count: { select: { roles: true } } },
        });
        if (!existing) {
            return NextResponse.json(
                makeValidationError("Campaign not found", "id"),
                { status: 404 }
            );
        }
        if (existing.ownerId !== session.user.id) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }
        if (existing.status !== "DRAFT") {
            return NextResponse.json(
                makeValidationError("Only draft campaigns can be submitted", "status"),
                { status: 400 }
            );
        }
        if (existing._count.roles === 0) {
            return NextResponse.json(
                makeValidationError("Add at least one role before submitting", "roles"),
                { status: 400 }
            );
        }

        const updated = await prisma.campaign.update({
            where: { id },
            data: { status: CampaignStatus.PENDING },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error("[API] Error submitting campaign:", error);
        return NextResponse.json({ error: "Failed to submit campaign" }, { status: 500 });
    }
}
