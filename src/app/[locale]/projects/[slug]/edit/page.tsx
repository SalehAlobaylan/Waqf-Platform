import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProjectForm } from "@/components/projects/ProjectForm";

interface Props {
    params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    const project = await prisma.project.findUnique({
        where: { slug },
        select: { title: true },
    });
    return { title: project ? `Edit ${project.title} | Waqf` : "Edit Project | Waqf" };
}

export default async function EditProjectPage({ params }: Props) {
    const { locale, slug } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
        redirect(`/${locale}/login`);
    }

    const project = await prisma.project.findUnique({
        where: { slug },
        include: {
            skills: {
                include: { skill: true },
            },
        },
    });

    if (!project) {
        notFound();
    }

    // Check ownership
    if (project.ownerId !== session.user.id) {
        redirect(`/${locale}/projects/${slug}`);
    }

    // Fetch user's organizations
    const organizations = await prisma.organization.findMany({
        where: { userId: session.user.id },
        select: { id: true, name: true },
    });

    return (
        <ProjectForm
            locale={locale}
            mode="edit"
            initialData={{
                id: project.id,
                title: project.title,
                slug: project.slug,
                description: project.description,
                category: project.category,
                language: project.language,
                impact: project.impact,
                timeCommitment: project.timeCommitment,
                duration: project.duration,
                githubUrl: project.githubUrl,
                featuredImage: project.featuredImage,
                organizationId: project.organizationId,
                status: project.status,
                adminFeedback: project.adminFeedback,
                skills: project.skills.map(s => ({
                    skillId: s.skillId,
                    skill: { id: s.skill.id, name: s.skill.name, nameAr: s.skill.nameAr },
                    isRequired: s.isRequired,
                })),
            }}
            organizations={organizations}
        />
    );
}
