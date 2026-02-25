import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ProjectStatus } from "@prisma/client";

/**
 * GET /api/projects
 * List projects with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const limit = Math.min(parseInt(searchParams.get("limit") || "12", 10), 50);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const category = searchParams.get("category");
    const status = searchParams.get("status") || "OPEN";
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "newest";

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

    const body = await request.json();
    const {
      title,
      description,
      category,
      language,
      timeCommitment,
      duration,
      impact,
      githubUrl,
      skills,
    } = body;

    // Validation
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Title, description, and category are required" },
        { status: 400 }
      );
    }

    // Generate slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

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
