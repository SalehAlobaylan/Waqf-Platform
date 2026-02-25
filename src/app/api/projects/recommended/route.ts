import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getRecommendedProjects,
  ContributorMatchData,
  ProjectMatchData,
  RecommendedProjectsResponse,
} from "@/lib/matching";
import { ProjectStatus } from "@prisma/client";

/**
 * GET /api/projects/recommended
 *
 * Returns personalized project recommendations for the logged-in contributor.
 * Projects are scored using the Waqf Score algorithm (PRD §3.5).
 *
 * Query params:
 * - limit: number (default: 10, max: 50)
 * - offset: number (default: 0)
 * - category: ProjectCategory (optional filter)
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "10", 10),
      50
    );
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const category = searchParams.get("category");

    // TODO: Get authenticated user from session
    // For now, we'll use a mock user ID or return unauthorized
    const userId = searchParams.get("userId"); // Temporary for testing

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required. Provide userId for testing." },
        { status: 401 }
      );
    }

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
        { error: "Contributor profile not found. Please complete your profile." },
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
        avatar: p.owner.image,
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
