import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationDetailClient } from "@/components/applications/ApplicationDetailClient";

interface ApplicationDetailPageProps {
    params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: ApplicationDetailPageProps) {
    const { id } = await params;
    const application = await prisma.application.findUnique({
        where: { id },
        select: {
            project: { select: { title: true } },
        },
    });

    return {
        title: application
            ? `Application - ${application.project.title} | Waqf`
            : "Application | Waqf",
    };
}

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const { locale, id } = await params;

    const application = await prisma.application.findUnique({
        where: { id },
        include: {
            project: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    category: true,
                    ownerId: true,
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        },
                    },
                },
            },
            contributor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    contributorProfile: {
                        select: {
                            bio: true,
                            skills: {
                                include: {
                                    skill: true,
                                },
                            },
                        },
                    },
                },
            },
            messages: {
                orderBy: {
                    createdAt: "asc",
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        },
                    },
                },
            },
        },
    });

    if (!application) {
        notFound();
    }

    const isContributor = application.contributorId === session.user.id;
    const isOwner = application.project.ownerId === session.user.id;

    if (!isContributor && !isOwner) {
        redirect(`/${locale}/dashboard/applications`);
    }

    // Transform for client
    const clientApplication = {
        ...application,
        createdAt: application.createdAt.toISOString(),
        messages: application.messages.map(m => ({
            ...m,
            createdAt: m.createdAt.toISOString(),
            readAt: m.readAt?.toISOString() || null,
        })),
        contributor: {
            ...application.contributor,
            contributorProfile: application.contributor.contributorProfile ? {
                bio: application.contributor.contributorProfile.bio,
                skills: application.contributor.contributorProfile.skills.map(s => ({
                    skill: { name: s.skill.name },
                    level: s.level,
                })),
            } : null,
        },
    };

    return (
        <ApplicationDetailClient
            application={clientApplication}
            isOwner={isOwner}
            isContributor={isContributor}
        />
    );
}
