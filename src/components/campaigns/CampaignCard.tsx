"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Megaphone, Users, CheckCircle } from "lucide-react";
import { CampaignOverallProgress } from "@/components/campaigns/ProgressBar";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";

export interface CampaignCardData {
    id: string;
    slug: string;
    title: string;
    pitch: string;
    category: string;
    status: string;
    country?: string | null;
    owner: { name: string; image: string | null };
    organization?: { name: string; logo: string | null } | null;
    roles: Array<{
        id: string;
        count: number;
        filledCount: number;
        skill: { name: string; nameAr: string | null };
    }>;
    _count?: { joins: number };
    viewCount?: number;
    createdAt?: Date | string;
    totalRoles?: number;
    filledRoles?: number;
}

const CATEGORY_BG: Record<string, string> = {
    QURAN: "from-indigo-500/10 to-indigo-500/5",
    PRAYER: "from-emerald-500/10 to-emerald-500/5",
    CHARITY: "from-amber-500/10 to-amber-500/5",
    EDUCATION: "from-blue-500/10 to-blue-500/5",
    COMMUNITY: "from-purple-500/10 to-purple-500/5",
    TOOLS: "from-slate-500/10 to-slate-500/5",
};

export function CampaignCard({ campaign }: { campaign: CampaignCardData }) {
    const locale = useLocale();
    const tCard = useTranslations("campaigns.card");

    const totalSeats = campaign.roles.reduce((sum, r) => sum + r.count, 0);
    const filledSeats = campaign.roles.reduce((sum, r) => sum + Math.min(r.filledCount, r.count), 0);
    const totalRoles = campaign.totalRoles ?? campaign.roles.length;
    const filledRoles = campaign.filledRoles ?? campaign.roles.filter((r) => r.filledCount >= r.count && r.count > 0).length;
    const overall = totalSeats > 0 ? Math.round((filledSeats / totalSeats) * 100) : 0;

    const grad = CATEGORY_BG[campaign.category] ?? "from-primary-500/10 to-primary-500/5";

    return (
        <Link
            href={`/${locale}/campaigns/${campaign.slug}`}
            className="group flex flex-col rounded-2xl bg-white border border-waqf-border hover:border-primary-600/40 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
        >
            <div className={`relative h-32 bg-gradient-to-br ${grad} flex items-center justify-center`}>
                <Megaphone className="w-10 h-10 text-primary-600/30" strokeWidth={1.5} />
                <div className="absolute top-3 left-3">
                    <CampaignStatusBadge status={campaign.status} />
                </div>
                {campaign.organization?.name && (
                    <div className="absolute top-3 right-3 max-w-[60%] truncate rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold text-secondary-700">
                        {campaign.organization.name}
                    </div>
                )}
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-secondary-900 line-clamp-2 mb-2 group-hover:text-primary-700 transition-colors">
                    {campaign.title}
                </h3>
                <p className="text-sm text-secondary-600 line-clamp-2 mb-4">
                    {campaign.pitch}
                </p>

                <div className="mb-4">
                    <CampaignOverallProgress percent={overall} />
                </div>

                <div className="mt-auto flex items-center justify-between text-xs text-secondary-500">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-medium truncate">
                            {tCard("by")} {campaign.owner.name}
                        </span>
                        <CheckCircle className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <Users className="w-3.5 h-3.5" />
                        <span>
                            {tCard("rolesFilled", {
                                filled: filledRoles,
                                total: totalRoles,
                            })}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
