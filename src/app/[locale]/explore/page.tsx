import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";
import { ExplorePageClient } from "@/components/explore/ExplorePageClient";

export const metadata = {
    title: "Explore Projects | Waqf",
    description: "Discover Islamic open-source projects and contribute your skills as sadaqah jariyah",
};

export default async function ExplorePage() {
    // Fetch initial projects
    const projects = await prisma.project.findMany({
        where: {
            status: ProjectStatus.OPEN,
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
                    avatar: true,
                },
            },
            _count: {
                select: {
                    applications: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 24,
    });

    // Fetch skills for filter
    const skills = await prisma.skill.findMany({
        orderBy: {
            name: "asc",
        },
    });

    // Transform data for client component (handle null nameAr)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedProjects = projects as any;
    const transformedSkills = skills.map(s => ({
        id: s.id,
        name: s.name,
        nameAr: s.nameAr || s.name,
        category: s.category,
    }));

    return (
        <ExplorePageClient
            initialProjects={transformedProjects}
            skills={transformedSkills}
        />
    );
}

