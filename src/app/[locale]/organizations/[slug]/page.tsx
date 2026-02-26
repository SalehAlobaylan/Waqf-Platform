import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { OrganizationProfile } from "@/components/organizations/OrganizationProfile";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const org = await prisma.organization.findUnique({ where: { slug } });

    if (!org) return { title: "Organization Not Found" };
    return { title: `${org.name} | Waqf` };
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
                    _count: { select: { applications: true } }
                }
            }
        }
    });

    if (!org) {
        notFound();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedOrg = org as any;

    return (
        <div className="min-h-screen bg-secondary-50 py-8">
            <div className="container max-w-5xl mx-auto px-4">
                <OrganizationProfile organization={transformedOrg} locale={locale} />
            </div>
        </div>
    );
}
