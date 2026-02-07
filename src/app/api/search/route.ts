import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";

/**
 * GET /api/search
 * Full-text search across projects
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q")?.trim();
        const category = searchParams.get("category");
        const status = searchParams.get("status") || "OPEN";
        const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
        const offset = parseInt(searchParams.get("offset") || "0");

        if (!query || query.length < 2) {
            return NextResponse.json({
                projects: [],
                total: 0,
                query: query || "",
            });
        }

        // Build search conditions
        const searchTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
        
        // Using Prisma's native search (contains) for now
        // For production, consider using PostgreSQL full-text search via raw queries
        const whereCondition = {
            AND: [
                {
                    status: status === "ALL" 
                        ? { in: [ProjectStatus.OPEN, ProjectStatus.IN_PROGRESS, ProjectStatus.COMPLETED] }
                        : status as ProjectStatus,
                },
                ...(category ? [{ category: category as any }] : []),
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
                        avatar: true,
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
