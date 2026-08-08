import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationCard } from "@/components/applications/ApplicationCard";
import { Briefcase, Inbox } from "lucide-react";
import Link from "next/link";

interface ApplicationsPageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ApplicationsPageProps) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return {
        title: t("dashboardApplications"),
    };
}

export default async function ApplicationsPage({ params }: ApplicationsPageProps) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "dashboard.applications" });
    const tApps = await getTranslations({ locale, namespace: "applications" });
    const tLanding = await getTranslations({ locale, namespace: "landing" });
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
        redirect(`/${locale}/login`);
    }

    const applications = await prisma.application.findMany({
        where: {
            contributorId: session.user.id,
        },
        include: {
            project: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    category: true,
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
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
        orderBy: {
            createdAt: "desc",
        },
    });

    const pendingCount = applications.filter(a => a.status === "PENDING").length;
    const acceptedCount = applications.filter(a => a.status === "ACCEPTED").length;

    return (
        <div className="min-h-screen bg-secondary-50">
            <div className="container max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-secondary-900">
                        {t("title")}
                    </h1>
                    <p className="text-secondary-500 mt-1">
                        {t("subtitle")}
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-secondary-100 p-4 text-center">
                        <div className="text-2xl font-bold text-secondary-900">{applications.length}</div>
                        <div className="text-sm text-secondary-500">
                            {locale === "ar" ? "إجمالي الطلبات" : "Total"}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-secondary-100 p-4 text-center">
                        <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
                        <div className="text-sm text-secondary-500">
                            {tApps("filterPending")}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-secondary-100 p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{acceptedCount}</div>
                        <div className="text-sm text-secondary-500">
                            {tApps("filterAccepted")}
                        </div>
                    </div>
                </div>

                {applications.length > 0 ? (
                    <div className="space-y-4">
                        {applications.map((application) => (
                            <ApplicationCard
                                key={application.id}
                                application={application}
                                variant="contributor"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-secondary-100 p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 rounded-full flex items-center justify-center">
                            <Inbox className="w-8 h-8 text-secondary-400" />
                        </div>
                        <h3 className="text-lg font-medium text-secondary-900 mb-2">
                            {t("noApplications")}
                        </h3>
                        <p className="text-secondary-500 mb-6 max-w-md mx-auto">
                            {t("noApplicationsDescription")}
                        </p>
                        <Link
                            href={`/${locale}/explore`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
                        >
                            <Briefcase className="w-5 h-5" />
                            {tLanding("exploreProjects")}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
