import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { ExplorePageClient } from "@/components/explore/ExplorePageClient";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return {
        title: t("explore"),
    };
}

export default async function ExplorePage() {
    const projects = await prisma.project.findMany({
        where: {
            status: ProjectStatus.OPEN,
        },
        select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            category: true,
            status: true,
            source: true,
            tags: true,
            timeCommitment: true,
            featured: true,
            featuredImage: true,
            websiteUrl: true,
            githubUrl: true,
            isOpenSource: true,
            screenshots: true,
            toolsPreview: true,
            createdAt: true,
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
        orderBy: {
            createdAt: "desc",
        },
        take: 24,
    });

    const skills = await prisma.skill.findMany({
        orderBy: {
            name: "asc",
        },
    });

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
