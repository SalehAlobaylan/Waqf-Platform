import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { routeIdParamSchema } from "@/lib/validation/schemas";
import { parseParams } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/contributors/[id]
 * Fetch a contributor profile by user ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const parsedParams = parseParams(await params, routeIdParamSchema);
    if (!parsedParams.success) {
      return NextResponse.json(parsedParams.error, { status: 400 });
    }

    const { id } = parsedParams.data;

    // Fetch user with contributor profile and skills
    // Note: email and role are intentionally excluded — this is a public
    // profile endpoint and must not disclose contact data.
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
        contributorProfile: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        makeValidationError("User not found", "id"),
        { status: 404 }
      );
    }

    // Transform data (use actual schema fields)
    const profile = {
      id: user.id,
      name: user.name,
      avatar: user.image,
      createdAt: user.createdAt,
      bio: user.contributorProfile?.bio || null,
      timezone: user.contributorProfile?.timezone || null,
      githubUsername: user.contributorProfile?.githubUsername || null,
      hoursPerWeek: user.contributorProfile?.hoursPerWeek || 0,
      isAvailable: user.contributorProfile?.isAvailable || false,
      preferredCategories: user.contributorProfile?.preferredCategories || [],
      spokenLanguages: user.contributorProfile?.spokenLanguages || [],
      skills: user.contributorProfile?.skills.map((cs) => ({
        id: cs.skill.id,
        name: cs.skill.name,
        nameAr: cs.skill.nameAr || cs.skill.name,
        category: cs.skill.category,
        level: cs.level,
      })) || [],
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[API] Error fetching contributor:", error);
    return NextResponse.json(
      { error: "Failed to fetch contributor" },
      { status: 500 }
    );
  }
}
