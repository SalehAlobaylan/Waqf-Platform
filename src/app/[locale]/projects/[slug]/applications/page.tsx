import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationCard } from "@/components/applications/ApplicationCard";
import { ArrowLeft, Users, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

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
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const { locale, slug } = await params;

    // Get project and verify ownership
    const project = await prisma.project.findUnique({
        where: { slug },
        select: {
            id: true,
            title: true,
            slug: true,
            ownerId: true,
            status: true,
        },
    });

    if (!project) {
        notFound();
    }

    if (project.ownerId !== session.user.id) {
        redirect(`/${locale}/projects/${slug}`);
    }

    // Fetch applications for this project
    const applications = await prisma.application.findMany({
        where: {
            projectId: project.id,
        },
        include: {
            project: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
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
            _count: {
                select: {
                    messages: true,
                },
            },
        },
        orderBy: [
            { status: "asc" },
            { createdAt: "desc" },
        ],
    });

    const pendingCount = applications.filter(a => a.status === "PENDING").length;
    const acceptedCount = applications.filter(a => a.status === "ACCEPTED").length;

    return (
        <div className="min-h-screen bg-secondary-50">
            <div className="container max-w-4xl mx-auto px-4 py-8">
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
                        {locale === "ar" ? "طلبات المساهمة" : "Applications"}
                    </h1>
                    <p className="text-secondary-500 mt-1">{project.title}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
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
                </div>

                {/* Applications List */}
                {applications.length > 0 ? (
                    <div className="space-y-4">
                        {applications.map((application) => (
                            <ApplicationCard
                                key={application.id}
                                application={application}
                                variant="owner"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-secondary-100 p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 rounded-full flex items-center justify-center">
                            <Users className="w-8 h-8 text-secondary-400" />
                        </div>
                        <h3 className="text-lg font-medium text-secondary-900 mb-2">
                            {locale === "ar" ? "لا توجد طلبات بعد" : "No applications yet"}
                        </h3>
                        <p className="text-secondary-500 max-w-md mx-auto">
                            {locale === "ar"
                                ? "شارك مشروعك لجذب المساهمين"
                                : "Share your project to attract contributors"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
