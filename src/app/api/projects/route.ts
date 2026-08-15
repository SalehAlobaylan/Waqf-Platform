import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { ProjectStatus, ProjectLanguage } from "@prisma/client";
import { projectCreateSchema, projectsQuerySchema } from "@/lib/validation/schemas";
import { parseBody, parseQuery } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";
import { assertSkillsExist } from "@/lib/validation/skills";
import { getSessionUser, isAdminUserId } from "@/lib/auth-helpers";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { calculateMatchScore } from "@/lib/matching/engine";
import type { ContributorMatchData, ProjectMatchData } from "@/lib/matching/types";

const PUBLIC_STATUSES: ProjectStatus[] = [ProjectStatus.OPEN];

/** Projects are OPEN-status only for anonymous/basic listing */
function getCommitmentRange(timeCommitment?: string): { min?: number; max?: number } | null {
  if (!timeCommitment) return null;
  switch (timeCommitment) {
    case "1-5":
      return { max: 5 };
    case "5-10":
      return { min: 5, max: 10 };
    case "10+":
      return { min: 10 };
    default:
      return null;
  }
}

/**
 * timeCommitment is a free-text string (e.g. "10-15 hours/week",
 * "١٠-١٥ ساعة/أسبوع"). Extract the first number and test it against
 * the requested range. Unparseable values never match.
 */
function matchesCommitment(value: string | null, range: { min?: number; max?: number } | null): boolean {
  if (!range || !value) return false;
  const normalized = value.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  const numbers = normalized.match(/\d+/g)?.map(Number).filter((n) => n > 0);
  if (!numbers?.length) return false;
  const first = numbers[0];
  if (range.min !== undefined && first < range.min) return false;
  if (range.max !== undefined && first > range.max) return false;
  return true;
}

/**
 * GET /api/projects
 * List projects with optional filters
 */
export async function GET(request: NextRequest) {
  return withApiHandler(request, "api.projects.list", async () => {
    const parsedQuery = parseQuery(request, projectsQuerySchema);
    if (!parsedQuery.success) {
      return NextResponse.json(parsedQuery.error, { status: 400 });
    }

    const { limit, offset, category, search, sortBy, status, skills, language, timeCommitment } = parsedQuery.data;

    const user = await getSessionUser();
    const isAdmin = await isAdminUserId(user?.id ?? "");

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    const requestedStatus = status as ProjectStatus | "all" | undefined;

    if (isAdmin) {
      if (requestedStatus && requestedStatus !== "all") {
        where.status = requestedStatus;
      }
    } else if (requestedStatus && requestedStatus !== "all") {
      if (PUBLIC_STATUSES.includes(requestedStatus)) {
        where.status = requestedStatus;
      } else if (user) {
        // Non-public statuses (DRAFT, PENDING, ...) are scoped to the owner
        where.status = requestedStatus;
        where.ownerId = user.id;
      } else {
        where.status = { in: PUBLIC_STATUSES };
      }
    } else {
      where.status = { in: PUBLIC_STATUSES };
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

    if (skills?.length) {
      where.skills = {
        some: {
          skillId: { in: skills },
        },
      };
    }

    if (language) {
      // A project written in both languages matches either choice
      where.language = language === ProjectLanguage.BOTH
        ? ProjectLanguage.BOTH
        : { in: [language, ProjectLanguage.BOTH] };
    }

    // Build order clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "oldest") {
      orderBy = { createdAt: "asc" };
    }

    const projectInclude = {
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
    };

    // Fetch ALL matching projects: timeCommitment needs in-memory filtering
    // and "recommended" needs in-memory scoring. Public listings are small.
    const projects = await prisma.project.findMany({
      where,
      include: projectInclude,
      orderBy,
    });

    // "recommended" sorts by the contributor's match score when the user has
    // a contributor profile, otherwise falls back to newest-first.
    if (sortBy === "recommended" && user) {
      const profile = await prisma.contributorProfile.findUnique({
        where: { userId: user.id },
        select: {
          preferredCategories: true,
          spokenLanguages: true,
          skills: {
            select: {
              skillId: true,
              level: true,
              skill: { select: { name: true } },
            },
          },
        },
      });

      if (profile) {
        const contributor: ContributorMatchData = {
          id: user.id,
          skills: profile.skills.map((s) => ({
            skillId: s.skillId,
            skillName: s.skill.name,
            level: s.level,
          })),
          preferredCategories: (profile.preferredCategories || []) as ProjectMatchData["category"][],
          spokenLanguages: profile.spokenLanguages?.length ? profile.spokenLanguages : ["ar", "en"],
        };

        const scored = projects
          .map((p) => {
            const projectMatch: ProjectMatchData = {
              id: p.id,
              title: p.title,
              slug: p.slug,
              description: p.description ?? "",
              category: p.category,
              language: p.language,
              createdAt: p.createdAt,
              skills: p.skills.map((s) => ({
                skillId: s.skillId,
                skillName: s.skill.name,
                isRequired: s.isRequired,
              })),
              owner: p.owner
                ? { id: p.owner.id, name: p.owner.name, image: p.owner.image }
                : null,
            };
            return { project: p, score: calculateMatchScore(contributor, projectMatch).totalScore };
          })
          .sort((a, b) => b.score - a.score)
          .map((s) => s.project);

        const final = timeCommitment
          ? scored.filter((p) => matchesCommitment(p.timeCommitment, getCommitmentRange(timeCommitment)))
          : scored;
        const total = final.length;
        return NextResponse.json({
          projects: final.slice(offset, offset + limit),
          pagination: { total, limit, offset, hasMore: offset + limit < total },
        });
      }
    }

    const final = timeCommitment
      ? projects.filter((p) => matchesCommitment(p.timeCommitment, getCommitmentRange(timeCommitment)))
      : projects;
    const total = final.length;

    return NextResponse.json({
      projects: final.slice(offset, offset + limit),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  });
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  const ctx: ApiHandlerContext = {};
  return withApiHandler(request, "api.projects.create", async () => {
    const user = await requireAuthOrThrow();
    ctx.userId = user.id;

    const rate = checkRateLimit(request, "project-create", { limit: 10, windowMs: 60_000 }, user.id);
    if (!rate.allowed) {
      return rateLimitedResponse(rate);
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
      status: newStatus,
    } = parsedBody.data;

    // Reject unknown skill ids before any mutation (400 instead of FK 409)
    if (skills?.length) {
      const skillError = await assertSkillsExist(skills.map((s) => s.skillId));
      if (skillError) {
        return NextResponse.json(skillError, { status: 400 });
      }
    }

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

    // Organization must belong to the creator (mirrors campaign routes)
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

    // Create project
    const project = await prisma.project.create({
      data: {
        title,
        slug,
        description,
        category,
        language: language || "BOTH",
        status: newStatus === "PENDING" ? ProjectStatus.PENDING : ProjectStatus.DRAFT,
        timeCommitment,
        duration,
        impact,
        githubUrl,
        featuredImage: featuredImage || null,
        organizationId: organizationId || null,
        ownerId: user.id,
        skills: skills?.length
          ? {
              create: skills.map((s: { skillId: number; isRequired?: boolean }) => ({
                skillId: s.skillId,
                isRequired: Boolean(s.isRequired ?? false),
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
  }, ctx);
}
