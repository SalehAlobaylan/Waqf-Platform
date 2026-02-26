import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/projects/[id]
 * Fetch a single project by ID or slug
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
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
            image: true,
            email: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("[API] Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[id]
 * Update a project
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check ownership
    const existing = await prisma.project.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (existing.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
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
      slug: newSlug,
      skills,
    } = body;

    // If slug changed, verify uniqueness
    if (newSlug) {
      const slugExists = await prisma.project.findFirst({
        where: { slug: newSlug, id: { not: id } },
      });
      if (slugExists) {
        return NextResponse.json({ error: "Slug already taken" }, { status: 400 });
      }
    }

    // If skills provided, replace them
    if (skills && Array.isArray(skills)) {
      await prisma.projectSkill.deleteMany({ where: { projectId: id } });
      if (skills.length > 0) {
        await prisma.projectSkill.createMany({
          data: skills.map((s: { skillId: number; isRequired: boolean }) => ({
            projectId: id,
            skillId: s.skillId,
            isRequired: s.isRequired ?? false,
          })),
        });
      }
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(language && { language }),
        ...(newSlug && { slug: newSlug }),
        ...(timeCommitment !== undefined && { timeCommitment }),
        ...(duration !== undefined && { duration }),
        ...(impact !== undefined && { impact }),
        ...(githubUrl !== undefined && { githubUrl }),
        ...(featuredImage !== undefined && { featuredImage }),
        ...(organizationId !== undefined && { organizationId: organizationId || null }),
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

    return NextResponse.json(project);
  } catch (error) {
    console.error("[API] Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete a project
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const existing = await prisma.project.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (existing.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ message: "Project deleted" });
  } catch (error) {
    console.error("[API] Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
