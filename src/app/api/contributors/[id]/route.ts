import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/contributors/[id]
 * Fetch a contributor profile by user ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Fetch user with contributor profile and skills
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Transform data (use actual schema fields)
    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
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
