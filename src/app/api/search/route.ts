import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, ProjectCategory, ProjectStatus } from "@prisma/client";
import { searchQuerySchema } from "@/lib/validation/schemas";
import { parseQuery } from "@/lib/validation/parse";

/**
 * GET /api/search
 * Full-text search across projects
 */
export async function GET(request: NextRequest) {
    try {
        const parsedQuery = parseQuery(request, searchQuerySchema);
        if (!parsedQuery.success) {
            return NextResponse.json(parsedQuery.error, { status: 400 });
        }

        const { q: query, category, status = "OPEN", limit, offset } = parsedQuery.data;

        if (!query) {
            return NextResponse.json({
                projects: [],
                total: 0,
                query: "",
            });
        }

        // Build search conditions
        const searchTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
        
        // Using Prisma's native search (contains) for now
        // For production, consider using PostgreSQL full-text search via raw queries
        const whereCondition: Prisma.ProjectWhereInput = {
            AND: [
                ...(status === "ALL"
                    ? [{ status: { in: [ProjectStatus.OPEN, ProjectStatus.IN_PROGRESS, ProjectStatus.COMPLETED] } }]
                    : [{ status: status as ProjectStatus }]),
                ...(category ? [{ category: category as ProjectCategory }] : []),
                {
                    OR: searchTerms.map(term => ({
                        OR: [
                            { title: { contains: term, mode: "insensitive" as const } },
                            { description: { contains: term, mode: "insensitive" as const } },
                            { impact: { contains: term, mode: "insensitive" as const } },
                        ],
                    })),
                },
            ],
        };

        // Count total matches
        const total = await prisma.project.count({ where: whereCondition });

        // Fetch matching projects
        const projects = await prisma.project.findMany({
            where: whereCondition,
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
                _count: {
                    select: {
                        applications: true,
                    },
                },
            },
            orderBy: [
                { featured: "desc" },
                { createdAt: "desc" },
            ],
            skip: offset,
            take: limit,
        });

        return NextResponse.json({
            projects,
            total,
            query,
            limit,
            offset,
        });
    } catch (error) {
        console.error("[API] Search error:", error);
        return NextResponse.json(
            { error: "Search failed" },
            { status: 500 }
        );
    }
}
