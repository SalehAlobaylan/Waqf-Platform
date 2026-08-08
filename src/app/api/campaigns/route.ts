import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CampaignStatus, ProjectCategory, ProjectLanguage, Prisma } from "@prisma/client";
import {
    campaignCreateSchema,
    campaignsQuerySchema,
} from "@/lib/validation/schemas";
import { parseBody, parseQuery } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";
import { buildCampaignSlug, ensureUniqueCampaignSlug } from "@/lib/campaigns/slug";
import { getSessionUser, isAdminUserId } from "@/lib/auth-helpers";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

const PUBLIC_STATUSES: CampaignStatus[] = ["RECRUITING", "READY", "COMPLETED"];

export async function GET(request: NextRequest) {
    try {
        const parsedQuery = parseQuery(request, campaignsQuerySchema);
        if (!parsedQuery.success) {
            return NextResponse.json(parsedQuery.error, { status: 400 });
        }

        const { limit, offset, category, search, skills, status } = parsedQuery.data;

        const user = await getSessionUser();
        const isAdmin = await isAdminUserId(user?.id ?? "");

        const where: Prisma.CampaignWhereInput = {};

        if (isAdmin) {
            if (status === "ALL") {
                where.status = { in: [...PUBLIC_STATUSES, CampaignStatus.DRAFT, CampaignStatus.PENDING, CampaignStatus.CANCELLED] };
            } else {
                where.status = status;
            }
        } else if (status === "ALL") {
            where.status = { in: PUBLIC_STATUSES };
        } else if (PUBLIC_STATUSES.includes(status)) {
            where.status = status;
        } else if (user) {
            // Non-public statuses (DRAFT, PENDING, CANCELLED) are scoped to the owner
            where.status = status;
            where.ownerId = user.id;
        } else {
            where.status = { in: PUBLIC_STATUSES };
        }

        if (category) {
            where.category = category;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { pitch: { contains: search, mode: "insensitive" } },
                { problem: { contains: search, mode: "insensitive" } },
            ];
        }

        if (skills) {
            const skillIds = skills
                .split(",")
                .map((s) => Number(s.trim()))
                .filter((n) => Number.isFinite(n) && n > 0);
            if (skillIds.length > 0) {
                where.roles = { some: { skillId: { in: skillIds } } };
            }
        }

        const [campaigns, total] = await Promise.all([
            prisma.campaign.findMany({
                where,
                include: {
                    owner: { select: { id: true, name: true, image: true } },
                    organization: { select: { id: true, name: true, logo: true } },
                    roles: { include: { skill: true } },
                    _count: { select: { joins: true } },
                },
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: offset,
            }),
            prisma.campaign.count({ where }),
        ]);

        return NextResponse.json({
            campaigns,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total,
            },
        });
    } catch (error) {
        console.error("[API] Error fetching campaigns:", error);
        return NextResponse.json(
            { error: "Failed to fetch campaigns" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        if (!checkRateLimit(request, "campaign-create", { limit: 5, windowMs: 60_000 }, session.user.id)) {
            return rateLimitedResponse();
        }

        const parsedBody = await parseBody(request, campaignCreateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const data = parsedBody.data;

        // Validate organization ownership if provided
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

        // Validate skills exist if any
        if (data.roles && data.roles.length > 0) {
            const skillIds = data.roles.map((r) => r.skillId);
            const found = await prisma.skill.findMany({
                where: { id: { in: skillIds } },
                select: { id: true },
            });
            if (found.length !== new Set(skillIds).size) {
                return NextResponse.json(
                    makeValidationError("One or more skills not found", "roles"),
                    { status: 400 }
                );
            }
        }

        const baseSlug = data.customSlug
            ? data.customSlug.toLowerCase()
            : buildCampaignSlug(data.title);
        const slug = await ensureUniqueCampaignSlug(baseSlug);

        const campaign = await prisma.campaign.create({
            data: {
                ownerId: session.user.id,
                organizationId: data.organizationId || null,
                title: data.title,
                slug,
                pitch: data.pitch,
                problem: data.problem,
                outcome: data.outcome ?? null,
                category: data.category as ProjectCategory,
                language: (data.language ?? ProjectLanguage.BOTH) as ProjectLanguage,
                country: data.country ?? null,
                startsAt: data.startsAt ?? null,
                recruitmentDeadline: data.recruitmentDeadline ?? null,
                contactEmail: data.contactEmail ?? null,
                coverImage: data.coverImage ?? null,
                tags: data.tags ?? [],
                status: CampaignStatus.DRAFT,
                roles: data.roles
                    ? {
                        create: data.roles.map((r) => ({
                            skillId: r.skillId,
                            title: r.title,
                            description: r.description ?? null,
                            count: r.count,
                            seniority: r.seniority ?? "ANY",
                            isRequired: r.isRequired ?? true,
                        })),
                    }
                    : undefined,
            },
            include: {
                roles: { include: { skill: true } },
            },
        });

        return NextResponse.json(campaign, { status: 201 });
    } catch (error) {
        console.error("[API] Error creating campaign:", error);
        return NextResponse.json(
            { error: "Failed to create campaign" },
            { status: 500 }
        );
    }
}
