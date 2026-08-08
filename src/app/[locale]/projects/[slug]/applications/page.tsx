import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { calculateMatchScore } from "@/lib/matching/engine";
import type { ContributorMatchData, ProjectMatchData } from "@/lib/matching/types";
import { ProjectCategory } from "@prisma/client";
import { ApplicationListClient } from "@/components/applications/ApplicationListClient";

interface ProjectApplicationsPageProps {
    params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: ProjectApplicationsPageProps) {
    const { slug } = await params;
    const project = await prisma.project.findUnique({
        where: { slug },
        select: { title: true },
    });
    return {
        title: project ? `Applications - ${project.title} | Waqf` : "Applications | Waqf",
    };
}

export default async function ProjectApplicationsPage({ params }: ProjectApplicationsPageProps) {
    const { locale, slug } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
        redirect(`/${locale}/login`);
    }

    // Get project with skills for matching
    const project = await prisma.project.findUnique({
        where: { slug },
        select: {
            id: true,
            title: true,
            slug: true,
            ownerId: true,
            status: true,
            category: true,
            language: true,
            createdAt: true,
            skills: {
                include: { skill: true },
            },
        },
    });

    if (!project) {
        notFound();
    }

    if (project.ownerId !== session.user.id) {
        redirect(`/${locale}/projects/${slug}`);
    }

    // Fetch applications
    const applications = await prisma.application.findMany({
        where: { projectId: project.id },
        include: {
            project: {
                select: { id: true, title: true, slug: true },
            },
            contributor: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                    email: true,
                    image: true,
                    contributorProfile: {
                        select: {
                            bio: true,
                            preferredCategories: true,
                            skills: {
                                include: { skill: true },
                            },
                        },
                    },
                },
            },
            _count: { select: { messages: true } },
        },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    // Build ProjectMatchData for the matching engine
    const projectMatchData: ProjectMatchData = {
        id: project.id,
        title: project.title,
        slug: project.slug,
        description: "",
        category: project.category,
        language: project.language,
        createdAt: project.createdAt,
        skills: project.skills.map(s => ({
            skillId: s.skillId,
            skillName: s.skill.name,
            isRequired: s.isRequired,
        })),
        owner: { id: project.ownerId, name: "", image: null },
    };

    // Compute match scores for each applicant
    const applicationsWithScores = applications.map(app => {
        let matchScore = 0;
        let breakdown = { skillScore: 0, categoryScore: 0, languageScore: 0, recencyScore: 0 };

        if (app.contributor.contributorProfile) {
            const contributorData: ContributorMatchData = {
                id: app.contributor.id,
                skills: app.contributor.contributorProfile.skills.map(s => ({
                    skillId: s.skillId,
                    skillName: s.skill.name,
                    level: s.level,
                })),
                preferredCategories: (app.contributor.contributorProfile.preferredCategories || []) as ProjectCategory[],
                spokenLanguages: ["ar", "en"], // Default — could be enriched
            };

            const result = calculateMatchScore(contributorData, projectMatchData);
            matchScore = result.totalScore;
            breakdown = result.breakdown;
        }

        return {
            ...app,
            matchScore,
            breakdown,
            createdAt: app.createdAt.toISOString(),
            updatedAt: app.updatedAt.toISOString(),
        };
    });

    const pendingCount = applications.filter(a => a.status === "PENDING").length;
    const acceptedCount = applications.filter(a => a.status === "ACCEPTED").length;
    const rejectedCount = applications.filter(a => a.status === "REJECTED").length;

    return (
        <div className="min-h-screen bg-secondary-50">
            <div className="container max-w-5xl mx-auto px-4 py-8">
                {/* Back Link */}
                <Link
                    href={`/${locale}/projects/${slug}`}
                    className="inline-flex items-center gap-2 text-secondary-500 hover:text-secondary-700 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {locale === "ar" ? "العودة للمشروع" : "Back to Project"}
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-secondary-900">
                        {locale === "ar" ? "الطلبات الواردة" : "Incoming Applications"}
                    </h1>
                    <p className="text-secondary-500 mt-1">{project.title}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-secondary-100 p-4 text-center">
                        <Users className="w-5 h-5 mx-auto mb-1 text-secondary-400" />
                        <div className="text-2xl font-bold text-secondary-900">{applications.length}</div>
                        <div className="text-xs text-secondary-500">
                            {locale === "ar" ? "إجمالي" : "Total"}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-secondary-100 p-4 text-center">
                        <Clock className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                        <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
                        <div className="text-xs text-secondary-500">
                            {locale === "ar" ? "قيد الانتظار" : "Pending"}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-secondary-100 p-4 text-center">
                        <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-500" />
                        <div className="text-2xl font-bold text-green-600">{acceptedCount}</div>
                        <div className="text-xs text-secondary-500">
                            {locale === "ar" ? "مقبول" : "Accepted"}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-secondary-100 p-4 text-center">
                        <XCircle className="w-5 h-5 mx-auto mb-1 text-red-400" />
                        <div className="text-2xl font-bold text-red-500">{rejectedCount}</div>
                        <div className="text-xs text-secondary-500">
                            {locale === "ar" ? "مرفوض" : "Rejected"}
                        </div>
                    </div>
                </div>

                {/* Client component with filter tabs and action buttons */}
                <ApplicationListClient
                    applications={applicationsWithScores}
                    locale={locale}
                />
            </div>
        </div>
    );
}
