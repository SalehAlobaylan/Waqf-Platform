import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ProjectStatus } from "@prisma/client";
import { projectCreateSchema, projectsQuerySchema } from "@/lib/validation/schemas";
import { parseBody, parseQuery } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";

/**
 * GET /api/projects
 * List projects with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const parsedQuery = parseQuery(request, projectsQuerySchema);
    if (!parsedQuery.success) {
      return NextResponse.json(parsedQuery.error, { status: 400 });
    }

    const { limit, offset, category, search, sortBy, status } = parsedQuery.data;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    
    if (status !== "all") {
      where.status = status as ProjectStatus;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build order clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "oldest") {
      orderBy = { createdAt: "asc" };
    }

    // Fetch projects
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({
      projects,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("[API] Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const parsedBody = await parseBody(request, projectCreateSchema);
    if (!parsedBody.success) {
      return NextResponse.json(parsedBody.error, { status: 400 });
    }

    const {
      title,
      description,
      category,
      language,
      timeCommitment,
      duration,
      impact,
      githubUrl,
      featuredImage,
      organizationId,
      customSlug,
      skills,
    } = parsedBody.data;

    // Generate or use custom slug
    const baseSlug = customSlug
      ? customSlug.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "")
      : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    // Ensure uniqueness
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

    // Create project
    const project = await prisma.project.create({
      data: {
        title,
        slug,
        description,
        category,
        language: language || "BOTH",
        status: ProjectStatus.DRAFT,
        timeCommitment,
        duration,
        impact,
        githubUrl,
        featuredImage: featuredImage || null,
        organizationId: organizationId || null,
        ownerId: session.user.id,
        skills: skills?.length
          ? {
              create: skills.map((s: { skillId: number; isRequired: boolean }) => ({
                skillId: s.skillId,
                isRequired: s.isRequired ?? false,
              })),
            }
          : undefined,
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
