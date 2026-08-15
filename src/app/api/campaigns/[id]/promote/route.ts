import { NextRequest, NextResponse } from "next/server";
import { requireAuthOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { routeIdParamSchema } from "@/lib/validation/schemas";
import { parseParams } from "@/lib/validation/parse";
import { makeNotFoundError, makeValidationError } from "@/lib/validation/errors";
import { promoteCampaignToProject } from "@/lib/campaigns/promote";
import { DomainError } from "@/lib/campaigns/errors";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

interface RouteParams {
    params: Promise<{ id: string }>;
}

function mapPromoteDomainError(error: unknown): NextResponse | null {
    if (error instanceof DomainError) {
        switch (error.code) {
            case "PROMOTE_CAMPAIGN_NOT_FOUND":
                return NextResponse.json(makeNotFoundError(error.message, "id"), { status: 404 });
            case "PROMOTE_NOT_OWNER":
                return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
            default:
                return NextResponse.json(
                    makeValidationError(error.message, "promote"),
                    { status: 400 }
                );
        }
    }
    return null;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.campaigns.promote", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const rate = checkRateLimit(request, "campaign-promote", { limit: 5, windowMs: 60_000 }, user.id);
        if (!rate.allowed) {
            return rateLimitedResponse(rate);
        }

        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }
        const { id } = parsedParams.data;

        try {
            const result = await promoteCampaignToProject(id, user.id);
            return NextResponse.json(result);
        } catch (err) {
            const mapped = mapPromoteDomainError(err);
            if (mapped) return mapped;
            throw err;
        }
    }, ctx);
}
