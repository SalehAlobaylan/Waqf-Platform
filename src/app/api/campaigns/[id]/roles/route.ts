import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { campaignRoleCreateSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { makeNotFoundError, makeValidationError } from "@/lib/validation/errors";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    return withApiHandler(request, "api.campaigns.roles.list", async () => {
        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }
        const { id } = parsedParams.data;
        const roles = await prisma.campaignRole.findMany({
            where: { campaignId: id },
            include: { skill: true, _count: { select: { joins: true } } },
            orderBy: { createdAt: "asc" },
        });
        return NextResponse.json({ roles });
    });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.campaigns.roles.create", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const rate = checkRateLimit(request, "campaign-role-create", { limit: 30, windowMs: 60_000 }, user.id);
        if (!rate.allowed) {
            return rateLimitedResponse(rate);
        }

        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }
        const parsedBody = await parseBody(request, campaignRoleCreateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const { id } = parsedParams.data;
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
        if (campaign.status === "READY" || campaign.status === "COMPLETED" || campaign.status === "CANCELLED") {
            return NextResponse.json(
                makeValidationError("Campaign is locked", "status"),
                { status: 400 }
            );
        }

        const data = parsedBody.data;
        const skill = await prisma.skill.findUnique({ where: { id: data.skillId } });
        if (!skill) {
            return NextResponse.json(
                makeValidationError("Skill not found", "skillId"),
                { status: 400 }
            );
        }

        const role = await prisma.campaignRole.create({
            data: {
                campaignId: id,
                skillId: data.skillId,
                title: data.title,
                description: data.description ?? null,
                count: data.count,
                seniority: data.seniority ?? "ANY",
                isRequired: data.isRequired ?? true,
            },
            include: { skill: true },
        });
        return NextResponse.json(role, { status: 201 });
    }, ctx);
}
