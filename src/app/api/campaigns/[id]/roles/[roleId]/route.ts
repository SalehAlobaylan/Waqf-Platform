import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { campaignRoleUpdateSchema, idSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";
import { CampaignRoleStatus } from "@prisma/client";

interface RouteParams {
    params: Promise<{ id: string; roleId: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        const parsedParams = parseParams(await params, routeIdParamSchema.extend({ roleId: idSchema }));
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }
        const parsedBody = await parseBody(request, campaignRoleUpdateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const { id, roleId } = parsedParams.data;
        const data = parsedBody.data;

        const role = await prisma.campaignRole.findUnique({
            where: { id: roleId },
            include: { campaign: { select: { ownerId: true, status: true } } },
        });
        if (!role || role.campaignId !== id) {
            return NextResponse.json(
                makeValidationError("Role not found", "roleId"),
                { status: 404 }
            );
        }
        if (role.campaign.ownerId !== session.user.id) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }
        if (role.campaign.status === "READY" || role.campaign.status === "COMPLETED" || role.campaign.status === "CANCELLED") {
            return NextResponse.json(
                makeValidationError("Campaign is locked", "status"),
                { status: 400 }
            );
        }

        if (data.count !== undefined && data.count < role.filledCount) {
            return NextResponse.json(
                makeValidationError(
                    `Cannot reduce count below current filled seats (${role.filledCount})`,
                    "count"
                ),
                { status: 400 }
            );
        }

        let newStatus = data.status;
        if (data.count !== undefined && data.count > role.filledCount && data.status === undefined) {
            newStatus = CampaignRoleStatus.OPEN;
        }

        const updated = await prisma.campaignRole.update({
            where: { id: roleId },
            data: {
                ...(data.title !== undefined && { title: data.title }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.count !== undefined && { count: data.count }),
                ...(data.seniority !== undefined && { seniority: data.seniority }),
                ...(data.isRequired !== undefined && { isRequired: data.isRequired }),
                ...(newStatus !== undefined && { status: newStatus }),
            },
            include: { skill: true },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error("[API] Error updating campaign role:", error);
        return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        const parsedParams = parseParams(await params, routeIdParamSchema.extend({ roleId: idSchema }));
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }
        const { id, roleId } = parsedParams.data;

        const role = await prisma.campaignRole.findUnique({
            where: { id: roleId },
            include: {
                campaign: { select: { ownerId: true, status: true } },
                _count: { select: { joins: true } },
            },
        });
        if (!role || role.campaignId !== id) {
            return NextResponse.json(
                makeValidationError("Role not found", "roleId"),
                { status: 404 }
            );
        }
        if (role.campaign.ownerId !== session.user.id) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }
        if (role.filledCount > 0 || role._count.joins > 0) {
            return NextResponse.json(
                makeValidationError("Cannot delete a role that has joins", "roleId"),
                { status: 400 }
            );
        }
        await prisma.campaignRole.delete({ where: { id: roleId } });
        return NextResponse.json({ message: "Role deleted" });
    } catch (error) {
        console.error("[API] Error deleting campaign role:", error);
        return NextResponse.json({ error: "Failed to delete role" }, { status: 500 });
    }
}
