import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { ProjectStatus } from "@prisma/client";
import { projectUpdateSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { makeNotFoundError, makeValidationError } from "@/lib/validation/errors";
import { assertSkillsExist } from "@/lib/validation/skills";
import { getSessionUser, isAdminUserId } from "@/lib/auth-helpers";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const PUBLIC_STATUSES: ProjectStatus[] = [ProjectStatus.OPEN];

/**
 * GET /api/projects/[id]
 * Fetch a single project by ID or slug
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  return withApiHandler(request, "api.projects.get", async () => {
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
      return NextResponse.json(makeNotFoundError("Project not found", "id"), { status: 404 });
    }

    // Non-public projects are only visible to their owner and admins.
    if (!PUBLIC_STATUSES.includes(project.status)) {
      const isOwner = user !== null && project.ownerId === user.id;
      const isAdmin = await isAdminUserId(user?.id ?? "");
      if (!isOwner && !isAdmin) {
        return NextResponse.json(makeNotFoundError("Project not found", "id"), { status: 404 });
      }
    }

    return NextResponse.json(project);
  });
}

/**
 * PUT /api/projects/[id]
 * Update a project
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const ctx: ApiHandlerContext = {};
  return withApiHandler(request, "api.projects.update", async () => {
    const user = await requireAuthOrThrow();
    ctx.userId = user.id;

    const rate = checkRateLimit(request, "project-update", { limit: 20, windowMs: 60_000 }, user.id);
    if (!rate.allowed) {
      return rateLimitedResponse(rate);
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
      return NextResponse.json(makeNotFoundError("Project not found", "id"), { status: 404 });
    }

    if (existing.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
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
      websiteUrl,
      isOpenSource,
      screenshots,
      toolsPreview,
      featuredImage,
      organizationId,
      slug: newSlug,
      skills,
      status: newStatus,
    } = parsedBody.data;

    // Reject unknown skill ids before any mutation (400 instead of FK 409)
    if (skills && skills.length) {
      const skillError = await assertSkillsExist(skills.map((s) => s.skillId));
      if (skillError) {
        return NextResponse.json(skillError, { status: 400 });
      }
    }

    // Organization must belong to the project owner (mirrors campaign routes)
    if (organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { userId: true },
      });
      if (!org || org.userId !== user.id) {
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

    // Owner can only resubmit a DRAFT project for review (DRAFT -> PENDING).
    // Validated BEFORE any mutation so a rejected submission never wipes skills.
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

    const project = await prisma.$transaction(async (tx) => {
      // If skills provided, replace them inside the transaction so a failure
      // rolls back both the update and the skill replacement.
      if (skills && Array.isArray(skills)) {
        await tx.projectSkill.deleteMany({ where: { projectId: id } });
        if (skills.length > 0) {
          await tx.projectSkill.createMany({
            data: skills.map((s: { skillId: number; isRequired?: boolean }) => ({
              projectId: id,
              skillId: s.skillId,
              isRequired: Boolean(s.isRequired ?? false),
            })),
          });
        }
      }

      return tx.project.update({
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
          ...(websiteUrl !== undefined && { websiteUrl }),
          ...(isOpenSource !== undefined && { isOpenSource }),
          ...(screenshots !== undefined && { screenshots }),
          ...(toolsPreview !== undefined && { toolsPreview }),
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
    });

    return NextResponse.json(project);
  }, ctx);
}

/**
 * DELETE /api/projects/[id]
 * Delete a project
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const ctx: ApiHandlerContext = {};
  return withApiHandler(request, "api.projects.delete", async () => {
    const user = await requireAuthOrThrow();
    ctx.userId = user.id;

    const rate = checkRateLimit(request, "project-delete", { limit: 10, windowMs: 60_000 }, user.id);
    if (!rate.allowed) {
      return rateLimitedResponse(rate);
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
      return NextResponse.json(makeNotFoundError("Project not found", "id"), { status: 404 });
    }

    if (existing.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
    }

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ message: "Project deleted" });
  }, ctx);
}
