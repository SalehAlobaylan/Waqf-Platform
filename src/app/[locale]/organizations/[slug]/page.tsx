import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { OrganizationProfile } from "@/components/organizations/OrganizationProfile";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
    const { locale, slug } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    const org = await prisma.organization.findUnique({ where: { slug } });

    if (!org) return { title: t("organizationNotFound") };
    return { title: t("organization") };
}

export default async function OrganizationPage({ params }: { params: Promise<{ locale: string, slug: string }> }) {
    const { locale, slug } = await params;

    const org = await prisma.organization.findUnique({
        where: { slug },
        include: {
            projects: {
                where: { status: "OPEN" },
                orderBy: { createdAt: "desc" },
                include: {
                    skills: { include: { skill: true } },
                    owner: { select: { name: true, image: true } },
                    _count: { select: { applications: true } }
                }
            }
        }
    });

    if (!org) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-secondary-50 py-8">
            <div className="container max-w-5xl mx-auto px-4">
                <OrganizationProfile organization={org} locale={locale} />
            </div>
        </div>
    );
}
