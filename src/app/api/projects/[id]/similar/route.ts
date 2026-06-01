import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { routeIdParamSchema } from "@/lib/validation/schemas";
import { parseParams } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }

        const { id } = parsedParams.data;

        // Fetch current project's category and skills
        const project = await prisma.project.findUnique({
            where: { id },
            select: {
                category: true,
                skills: { select: { skillId: true } },
            },
        });

        if (!project) {
            return NextResponse.json(
                makeValidationError("Project not found", "id"),
                { status: 404 }
            );
        }

        const skillIds = project.skills.map((s) => s.skillId);

        // Find similar projects by category, excluding self
        const similar = await prisma.project.findMany({
            where: {
                id: { not: id },
                status: "OPEN",
                OR: [
                    { category: project.category },
                    ...(skillIds.length > 0
                        ? [{ skills: { some: { skillId: { in: skillIds } } } }]
                        : []),
                ],
            },
            select: {
                id: true,
                slug: true,
                title: true,
                category: true,
                skills: {
                    take: 2,
                    include: { skill: { select: { name: true, nameAr: true } } },
                },
            },
            take: 4,
            orderBy: { viewCount: "desc" },
        });

        return NextResponse.json(similar);
    } catch (error) {
        console.error("[API] Similar projects error:", error);
        return NextResponse.json({ error: "Failed to fetch similar projects" }, { status: 500 });
    }
}
