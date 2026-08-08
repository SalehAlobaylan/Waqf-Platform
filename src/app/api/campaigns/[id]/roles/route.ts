import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { campaignRoleCreateSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
    try {
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
    } catch (error) {
        console.error("[API] Error fetching campaign roles:", error);
        return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
    }
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
            return NextResponse.json(
                makeValidationError("Campaign not found", "id"),
                { status: 404 }
            );
        }
        if (campaign.ownerId !== session.user.id) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
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
    } catch (error) {
        console.error("[API] Error creating campaign role:", error);
        return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
    }
}
