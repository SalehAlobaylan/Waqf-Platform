import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { CampaignStatus } from "@prisma/client";
import { routeIdParamSchema } from "@/lib/validation/schemas";
import { parseParams } from "@/lib/validation/parse";
import { makeNotFoundError, makeValidationError } from "@/lib/validation/errors";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.campaigns.cancel", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }
        const { id } = parsedParams.data;

        const existing = await prisma.campaign.findUnique({
            where: { id },
            select: { ownerId: true, status: true },
        });
        if (!existing) {
            return NextResponse.json(makeNotFoundError("Campaign not found", "id"), { status: 404 });
        }
        if (existing.ownerId !== user.id) {
            return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
        }
        if (existing.status === "READY" || existing.status === "COMPLETED" || existing.status === "CANCELLED") {
            return NextResponse.json(
                makeValidationError("Campaign can no longer be cancelled", "status"),
                { status: 400 }
            );
        }
        const updated = await prisma.campaign.update({
            where: { id },
            data: { status: CampaignStatus.CANCELLED },
        });
        return NextResponse.json(updated);
    }, ctx);
}
