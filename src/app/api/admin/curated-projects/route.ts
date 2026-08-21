import { NextRequest, NextResponse } from "next/server";
import { ProjectStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { projectCurateSchema, pagePaginationSchema } from "@/lib/validation/schemas";
import { parseBody, parseQuery } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";
import { assertSkillsExist } from "@/lib/validation/skills";
import { resolveProjectSlug } from "@/lib/campaigns/slug";

/**
 * GET /api/admin/curated-projects
 * List admin-curated external projects
 */
export async function GET(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.admin.curatedProjects.list", async () => {
        const admin = await requireAdminOrThrow();
        ctx.userId = admin.id;

        const parsedQuery = parseQuery(request, pagePaginationSchema);
        if (!parsedQuery.success) {
            return NextResponse.json(parsedQuery.error, { status: 400 });
        }

        const { page, limit } = parsedQuery.data;
        const offset = (page - 1) * limit;

        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                where: { source: "EXTERNAL" },
                include: {
                    addedByAdmin: { select: { id: true, name: true, email: true } },
                    skills: { include: { skill: true } },
                    _count: { select: { applications: true } },
                },
                orderBy: { createdAt: "desc" },
                skip: offset,
                take: limit,
            }),
            prisma.project.count({ where: { source: "EXTERNAL" } }),
        ]);

        return NextResponse.json({
            projects,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    }, ctx);
}

/**
 * POST /api/admin/curated-projects
 * Create a new admin-curated external project
 */
export async function POST(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.admin.curatedProjects.create", async () => {
        const admin = await requireAdminOrThrow();
        ctx.userId = admin.id;

        const parsedBody = await parseBody(request, projectCurateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const {
            title,
            customSlug,
            description,
            category,
            language,
            impact,
            timeCommitment,
            duration,
            featuredImage,
            externalUrl,
            externalOwnerName,
            externalOwnerContact,
            curatorNotes,
            status,
            featured,
            skills,
        } = parsedBody.data;

        if (skills?.length) {
            const skillError = await assertSkillsExist(skills.map((s) => s.skillId));
            if (skillError) {
                return NextResponse.json(skillError, { status: 400 });
            }
        }

        let slug: string;
        try {
            slug = await resolveProjectSlug(title, customSlug ?? undefined);
        } catch {
            return NextResponse.json(
                makeValidationError("Unable to generate unique slug", "customSlug"),
                { status: 400 }
            );
        }

        const project = await prisma.project.create({
            data: {
                title,
                slug,
                description,
                category,
                language: language || "BOTH",
                impact: impact || null,
                timeCommitment: timeCommitment || null,
                duration: duration || null,
                featuredImage: featuredImage || null,
                source: "EXTERNAL",
                externalOwnerName,
                externalOwnerContact,
                externalUrl,
                curatorNotes: curatorNotes || null,
                addedByAdminId: admin.id,
                ownerId: null,
                organizationId: null,
                status: status ? (status as ProjectStatus) : ProjectStatus.OPEN,
                featured: featured ?? false,
                skills: skills?.length
                    ? {
                        create: skills.map((s) => ({
                            skillId: s.skillId,
                            isRequired: s.isRequired ?? false,
                        })),
                    }
                    : undefined,
            },
            include: {
                addedByAdmin: { select: { id: true, name: true, email: true } },
                skills: { include: { skill: true } },
            },
        });

        return NextResponse.json(project, { status: 201 });
    }, ctx);
}
