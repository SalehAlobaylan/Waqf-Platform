import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";
import { exploreQuerySchema } from "@/lib/validation/schemas";
import { parseQuery } from "@/lib/validation/parse";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";

export async function GET(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.explore", async () => {
        const parsedQuery = parseQuery(request, exploreQuerySchema);
        if (!parsedQuery.success) {
            return NextResponse.json(parsedQuery.error, { status: 400 });
        }

        const { limit, page, category, search, skills, language } = parsedQuery.data;
        const offset = (page - 1) * limit;

        const skillIds = skills
            ? skills.split(",").map((id) => parseInt(id, 10)).filter((id) => !Number.isNaN(id))
            : [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {
            status: ProjectStatus.OPEN,
        };

        if (category) where.category = category;
        if (language) where.language = language;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { impact: { contains: search, mode: "insensitive" } },
            ];
        }
        if (skillIds.length > 0) {
            where.skills = { some: { skillId: { in: skillIds } } };
        }

        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                where,
                include: {
                    skills: { include: { skill: true } },
                    owner: { select: { id: true, name: true, image: true } },
                    _count: { select: { applications: true } },
                },
                orderBy: { createdAt: "desc" },
                skip: offset,
                take: limit,
            }),
            prisma.project.count({ where }),
        ]);

        return NextResponse.json({
            projects,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    }, ctx);
}
