import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/projects/ProjectForm";

type Props = {
    params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return { title: t("adminEditCuratedProject") };
}

export default async function EditCuratedProjectPage({ params }: Props) {
    const { locale, id } = await params;
    setRequestLocale(locale);

    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            skills: { include: { skill: true } },
        },
    });

    if (!project || project.source !== "EXTERNAL") {
        notFound();
    }

    return (
        <ProjectForm
            locale={locale}
            mode="curate"
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
                externalUrl: project.externalUrl,
                externalOwnerName: project.externalOwnerName,
                externalOwnerContact: project.externalOwnerContact,
                curatorNotes: project.curatorNotes,
                skills: project.skills.map((s) => ({
                    skillId: s.skillId,
                    skill: { id: s.skill.id, name: s.skill.name, nameAr: s.skill.nameAr },
                    isRequired: s.isRequired,
                })),
            }}
        />
    );
}
