import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { ProjectStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { projectCurateSchema } from "@/lib/validation/schemas";
import { parseBody, parseQuery } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";
import { pagePaginationSchema } from "@/lib/validation/schemas";

/**
 * GET /api/admin/curated-projects
 * List admin-curated external projects
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });

        if (user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

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
    } catch (error) {
        console.error("[API] Curated projects list error:", error);
        return NextResponse.json(
            { error: "Failed to fetch curated projects" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/curated-projects
 * Create a new admin-curated external project
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });

        if (user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

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

        const baseSlug = customSlug
            ? customSlug.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "")
            : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

        let slug = baseSlug;
        let counter = 0;
        while (await prisma.project.findUnique({ where: { slug } })) {
            counter++;
            slug = `${baseSlug}-${counter}`;
            if (counter > 50) {
                return NextResponse.json(
                    makeValidationError("Unable to generate unique slug", "customSlug"),
                    { status: 400 }
                );
            }
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
                addedByAdminId: session.user.id,
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
    } catch (error) {
        console.error("[API] Curated project create error:", error);
        return NextResponse.json(
            { error: "Failed to create curated project" },
            { status: 500 }
        );
    }
}
