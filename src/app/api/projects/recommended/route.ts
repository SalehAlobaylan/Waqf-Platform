import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getRecommendedProjects,
  ContributorMatchData,
  ProjectMatchData,
  RecommendedProjectsResponse,
} from "@/lib/matching";
import { ProjectStatus } from "@prisma/client";
import { recommendedProjectsQuerySchema } from "@/lib/validation/schemas";
import { parseQuery } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const parsedQuery = parseQuery(request, recommendedProjectsQuerySchema);

    if (!parsedQuery.success) {
      return NextResponse.json(parsedQuery.error, { status: 400 });
    }

    const { limit, offset, category } = parsedQuery.data;
    const userId = session.user.id;

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
        makeValidationError("Contributor profile not found. Please complete your profile.", "userId"),
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
      owner: {
        id: p.owner.id,
        name: p.owner.name,
        image: p.owner.image,
      },
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
  } catch (error) {
    console.error("[API] Error fetching recommended projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
