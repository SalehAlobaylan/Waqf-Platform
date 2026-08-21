import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import {
  getRecommendedProjects,
  MAX_RECOMMENDED_CANDIDATES,
  ContributorMatchData,
  ProjectMatchData,
  RecommendedProjectsResponse,
} from "@/lib/matching";
import { ProjectStatus } from "@prisma/client";
import { recommendedProjectsQuerySchema } from "@/lib/validation/schemas";
import { parseQuery } from "@/lib/validation/parse";
import { makeNotFoundError } from "@/lib/validation/errors";

export async function GET(request: NextRequest) {
  const ctx: ApiHandlerContext = {};
  return withApiHandler(request, "api.projects.recommended", async () => {
    const user = await requireAuthOrThrow();
    ctx.userId = user.id;

    const parsedQuery = parseQuery(request, recommendedProjectsQuerySchema);

    if (!parsedQuery.success) {
      return NextResponse.json(parsedQuery.error, { status: 400 });
    }

    const { limit, offset, category } = parsedQuery.data;
    const userId = user.id;

    // Fetch contributor profile with skills
    const contributor = await prisma.contributorProfile.findUnique({
      where: { userId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!contributor) {
      return NextResponse.json(
        makeNotFoundError("Contributor profile not found. Please complete your profile.", "userId"),
        { status: 404 }
      );
    }

    // Build contributor match data
    const contributorData: ContributorMatchData = {
      id: contributor.id,
      skills: contributor.skills.map((cs) => ({
        skillId: cs.skillId,
        skillName: cs.skill.name,
        level: cs.level,
      })),
      preferredCategories: contributor.preferredCategories,
      spokenLanguages: contributor.spokenLanguages,
    };

    // Build project query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectWhere: any = {
      status: ProjectStatus.OPEN,
    };

    if (category) {
      projectWhere.category = category;
    }

    // Fetch open projects with skills and owner
    const projects = await prisma.project.findMany({
      where: projectWhere,
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
      },
      orderBy: {
        createdAt: "desc",
      },
      // Bounded candidate window — recency decay zeroes projects older than
      // 30 days, so scoring beyond this window adds no ranking signal.
      take: MAX_RECOMMENDED_CANDIDATES,
    });

    // Convert to ProjectMatchData
    const projectData: ProjectMatchData[] = projects.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description,
      category: p.category,
      language: p.language,
      createdAt: p.createdAt,
      skills: p.skills.map((ps) => ({
        skillId: ps.skillId,
        skillName: ps.skill.name,
        isRequired: ps.isRequired,
      })),
      owner: p.owner
        ? {
            id: p.owner.id,
            name: p.owner.name,
            image: p.owner.image,
          }
        : null,
    }));

    // Get recommendations with scoring
    const { projects: recommended, total } = getRecommendedProjects(
      contributorData,
      projectData,
      { limit, offset }
    );

    // Build response
    const response: RecommendedProjectsResponse = {
      projects: recommended,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };

    return NextResponse.json(response);
  }, ctx);
}
