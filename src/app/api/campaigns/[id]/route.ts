import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CampaignStatus } from "@prisma/client";
import { campaignUpdateSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";
import { getSessionUser, isAdminUserId } from "@/lib/auth-helpers";

interface RouteParams {
    params: Promise<{ id: string }>;
}

const PUBLIC_STATUSES: CampaignStatus[] = ["RECRUITING", "READY", "COMPLETED"];

export async function GET(_request: NextRequest, { params }: RouteParams) {
    try {
        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }
        const { id } = parsedParams.data;

        const user = await getSessionUser();

        const campaign = await prisma.campaign.findFirst({
            where: { OR: [{ id }, { slug: id }] },
            include: {
                owner: { select: { id: true, name: true, username: true, image: true } },
                organization: { select: { id: true, name: true, logo: true, verified: true } },
                roles: { include: { skill: true }, orderBy: { createdAt: "asc" } },
                milestones: { orderBy: { order: "asc" } },
                promotedProject: { select: { id: true, slug: true, title: true, status: true } },
                _count: { select: { joins: true } },
            },
        });

        if (!campaign) {
            return NextResponse.json(
                makeValidationError("Campaign not found", "id"),
                { status: 404 }
            );
        }

        // Non-public campaigns are only visible to their owner and admins.
        if (!PUBLIC_STATUSES.includes(campaign.status)) {
            const isOwner = user !== null && campaign.ownerId === user.id;
            const isAdmin = await isAdminUserId(user?.id ?? "");
            if (!isOwner && !isAdmin) {
                return NextResponse.json(
                    makeValidationError("Campaign not found", "id"),
                    { status: 404 }
                );
            }
        }

        return NextResponse.json(campaign);
    } catch (error) {
        console.error("[API] Error fetching campaign:", error);
        return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }
        const parsedBody = await parseBody(request, campaignUpdateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const { id } = parsedParams.data;
        const data = parsedBody.data;

        const [existing, user] = await Promise.all([
            prisma.campaign.findUnique({
                where: { id },
                select: { ownerId: true, status: true, slug: true, title: true },
            }),
            prisma.user.findUnique({
                where: { id: session.user.id },
                select: { role: true },
            }),
        ]);
        if (!existing) {
            return NextResponse.json(
                makeValidationError("Campaign not found", "id"),
                { status: 404 }
            );
        }

        // Reuse the existing fetch: admin override, then owner check
        const isAdmin = user?.role === "ADMIN";
        if (!isAdmin && existing.ownerId !== session.user.id) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }

        if (existing.status === "READY" || existing.status === "COMPLETED" || existing.status === "CANCELLED") {
            return NextResponse.json(
                makeValidationError("Campaign can no longer be edited", "status"),
                { status: 400 }
            );
        }

        if (data.slug && data.slug !== existing.slug) {
            const taken = await prisma.campaign.findFirst({ where: { slug: data.slug, id: { not: id } } });
            if (taken) {
                return NextResponse.json(
                    makeValidationError("Slug already taken", "slug"),
                    { status: 400 }
                );
            }
        }

        if (data.organizationId) {
            const org = await prisma.organization.findUnique({
                where: { id: data.organizationId },
                select: { userId: true },
            });
            if (!org || org.userId !== session.user.id) {
                return NextResponse.json(
                    makeValidationError("Organization not found or not owned by you", "organizationId"),
                    { status: 400 }
                );
            }
        }

        const campaign = await prisma.campaign.update({
            where: { id },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.pitch && { pitch: data.pitch }),
                ...(data.problem && { problem: data.problem }),
                ...(data.outcome !== undefined && { outcome: data.outcome }),
                ...(data.category && { category: data.category }),
                ...(data.language && { language: data.language }),
                ...(data.country !== undefined && { country: data.country }),
                ...(data.startsAt !== undefined && { startsAt: data.startsAt }),
                ...(data.recruitmentDeadline !== undefined && {
                    recruitmentDeadline: data.recruitmentDeadline,
                }),
                ...(data.contactEmail !== undefined && { contactEmail: data.contactEmail }),
                ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
                ...(data.organizationId !== undefined && {
                    organizationId: data.organizationId || null,
                }),
                ...(data.slug && { slug: data.slug }),
                ...(data.tags && { tags: data.tags }),
            },
        });

        return NextResponse.json(campaign);
    } catch (error) {
        console.error("[API] Error updating campaign:", error);
        return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
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
            select: { ownerId: true, status: true, _count: { select: { joins: true } } },
        });
        if (!existing) {
            return NextResponse.json(
                makeValidationError("Campaign not found", "id"),
                { status: 404 }
            );
        }
        if (existing.status !== "DRAFT" && existing.status !== "CANCELLED") {
            return NextResponse.json(
                makeValidationError("Only draft or cancelled campaigns can be deleted", "status"),
                { status: 400 }
            );
        }
        if (existing.ownerId !== session.user.id) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { role: true },
            });
            if (user?.role !== "ADMIN") {
                return NextResponse.json({ error: "Not authorized" }, { status: 403 });
            }
        }

        await prisma.campaign.delete({ where: { id } });
        return NextResponse.json({ message: "Campaign deleted" });
    } catch (error) {
        console.error("[API] Error deleting campaign:", error);
        return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
    }
}
