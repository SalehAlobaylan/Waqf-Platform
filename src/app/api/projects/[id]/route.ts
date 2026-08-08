import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ProjectStatus } from "@prisma/client";
import { projectUpdateSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";
import { getSessionUser, isAdminUserId } from "@/lib/auth-helpers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const PUBLIC_STATUSES: ProjectStatus[] = [ProjectStatus.OPEN];

/**
 * GET /api/projects/[id]
 * Fetch a single project by ID or slug
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const parsedParams = parseParams(await params, routeIdParamSchema);
    if (!parsedParams.success) {
      return NextResponse.json(parsedParams.error, { status: 400 });
    }

    const { id } = parsedParams.data;

    const user = await getSessionUser();

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
      return NextResponse.json(
        makeValidationError("Project not found", "id"),
        { status: 404 }
      );
    }

    // Non-public projects are only visible to their owner and admins.
    if (!PUBLIC_STATUSES.includes(project.status)) {
      const isOwner = user !== null && project.ownerId === user.id;
      const isAdmin = await isAdminUserId(user?.id ?? "");
      if (!isOwner && !isAdmin) {
        return NextResponse.json(
          makeValidationError("Project not found", "id"),
          { status: 404 }
        );
      }
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

    const parsedParams = parseParams(await params, routeIdParamSchema);
    if (!parsedParams.success) {
      return NextResponse.json(parsedParams.error, { status: 400 });
    }

    const parsedBody = await parseBody(request, projectUpdateSchema);
    if (!parsedBody.success) {
      return NextResponse.json(parsedBody.error, { status: 400 });
    }

    const { id } = parsedParams.data;

    // Check ownership
    const existing = await prisma.project.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!existing) {
      return NextResponse.json(
        makeValidationError("Project not found", "id"),
        { status: 404 }
      );
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
      status: newStatus,
    } = parsedBody.data;

    // Organization must belong to the project owner (mirrors campaign routes)
    if (organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { userId: true },
      });
      if (!org || org.userId !== session.user.id) {
        return NextResponse.json(
          makeValidationError("Organization not found or not owned by you", "organizationId"),
          { status: 400 }
        );
      }
    }

    // If slug changed, verify uniqueness
    if (newSlug) {
      const slugExists = await prisma.project.findFirst({
        where: { slug: newSlug, id: { not: id } },
      });
      if (slugExists) {
        return NextResponse.json(
          makeValidationError("Slug already taken", "slug"),
          { status: 400 }
        );
      }
    }

    // If skills provided, replace them
    if (skills && Array.isArray(skills)) {
      await prisma.projectSkill.deleteMany({ where: { projectId: id } });
      if (skills.length > 0) {
        await prisma.projectSkill.createMany({
          data: skills.map((s: { skillId: number; isRequired?: boolean }) => ({
            projectId: id,
            skillId: s.skillId,
            isRequired: Boolean(s.isRequired ?? false),
          })),
        });
      }
    }

    // Owner can only resubmit a DRAFT project for review (DRAFT -> PENDING)
    if (newStatus) {
      const current = await prisma.project.findUnique({
        where: { id },
        select: { status: true },
      });
      if (current?.status !== "DRAFT") {
        return NextResponse.json(
          makeValidationError("Only draft projects can be submitted for review", "status"),
          { status: 400 }
        );
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
        ...(newStatus && {
          status: newStatus,
          adminFeedback: null,
        }),
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

    const parsedParams = parseParams(await params, routeIdParamSchema);
    if (!parsedParams.success) {
      return NextResponse.json(parsedParams.error, { status: 400 });
    }

    const { id } = parsedParams.data;

    // Check ownership
    const existing = await prisma.project.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!existing) {
      return NextResponse.json(
        makeValidationError("Project not found", "id"),
        { status: 404 }
      );
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
