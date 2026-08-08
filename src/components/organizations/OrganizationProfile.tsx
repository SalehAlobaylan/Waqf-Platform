import { ProjectCard } from "@/components/projects/ProjectCard";
import { Building2, Globe, CheckCircle2, MessageSquare, Phone, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Organization, Project } from "@prisma/client";

type OrganizationWithProjects = Organization & {
    projects: Array<
        Project & {
            skills: Array<{ skill: { name: string; nameAr: string | null }; isRequired: boolean }>;
            owner: { name: string; image: string | null } | null;
            _count: { applications: number };
        }
    >;
};

export function OrganizationProfile({ organization, locale }: { organization: OrganizationWithProjects, locale: string }) {
    return (
        <div className="space-y-6">
            {/* Back Link */}
            <Link
                href={`/${locale}/explore`}
                className="inline-flex items-center gap-1.5 text-sm text-secondary-500 hover:text-primary-600 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                {locale === "ar" ? "العودة للاستكشاف" : "Back to Explore"}
            </Link>

            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-secondary-100 p-8 shadow-sm text-center md:text-left md:flex md:items-start md:gap-6 relative overflow-hidden">
                <div aria-hidden="true" className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10 opacity-50"></div>

                <div className="w-24 h-24 mx-auto md:mx-0 rounded-2xl overflow-hidden bg-secondary-100 shrink-0 border border-secondary-200 flex items-center justify-center">
                    {organization.logo ? (
                        <img src={organization.logo} alt={organization.name} className="w-full h-full object-cover" />
                    ) : (
                        <Building2 size={40} className="text-secondary-400" />
                    )}
                </div>

                <div className="mt-4 md:mt-0 flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                        <h1 className="text-3xl font-bold text-secondary-900">{organization.name}</h1>
                        {organization.verified && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                                <CheckCircle2 size={14} />
                                {locale === "ar" ? "منظمة موثقة" : "Verified"}
                            </span>
                        )}
                    </div>

                    <p className="text-secondary-600 mb-6 max-w-2xl text-lg">
                        {organization.description || (locale === "ar" ? "لا يوجد وصف حالياً." : "No description provided.")}
                    </p>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        {organization.website && (
                            <a href={organization.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 bg-secondary-50 hover:bg-secondary-100 text-secondary-700 rounded-xl transition font-medium text-sm">
                                <Globe size={16} />
                                {locale === "ar" ? "الموقع الإلكتروني" : "Website"}
                            </a>
                        )}
                        {organization.discord && (
                            <a href={`https://discord.com/users/${organization.discord}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 text-[#5865F2] rounded-xl transition font-medium text-sm">
                                <MessageSquare size={16} />
                                Discord
                            </a>
                        )}
                        {organization.whatsapp && (
                            <a href={organization.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-xl transition font-medium text-sm">
                                <Phone size={16} />
                                WhatsApp
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Active Projects Grid */}
            <div>
                <h2 className="text-xl font-bold text-secondary-900 mb-4 px-2">
                    {locale === "ar" ? `مشاريع مفتوحة (${organization.projects.length})` : `Open Projects (${organization.projects.length})`}
                </h2>

                {organization.projects.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-secondary-100 p-12 text-center text-secondary-500">
                        {locale === "ar" ? "لا توجد مشاريع مفتوحة حالياً." : "No open projects currently."}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {organization.projects.map((project) => (
                            <ProjectCard key={project.id} project={project} locale={locale} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
