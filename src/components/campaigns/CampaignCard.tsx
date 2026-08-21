"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Users } from "lucide-react";
import { CampaignOverallProgress } from "@/components/campaigns/ProgressBar";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { getCategoryLabel, getCategoryTint } from "@/lib/categories";
import { cn } from "@/lib/utils";

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

export function CampaignCard({ campaign }: { campaign: CampaignCardData }) {
    const locale = useLocale();
    const tCard = useTranslations("campaigns.card");
    const tint = getCategoryTint(campaign.category);

    const totalSeats = campaign.roles.reduce((sum, r) => sum + r.count, 0);
    const filledSeats = campaign.roles.reduce((sum, r) => sum + Math.min(r.filledCount, r.count), 0);
    const totalRoles = campaign.totalRoles ?? campaign.roles.length;
    const filledRoles = campaign.filledRoles ?? campaign.roles.filter((r) => r.filledCount >= r.count && r.count > 0).length;
    const overall = totalSeats > 0 ? Math.round((filledSeats / totalSeats) * 100) : 0;

    return (
        <Link
            href={`/${locale}/campaigns/${campaign.slug}`}
            className="reveal group relative flex flex-col rounded-lg bg-white border border-waqf-border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-[0_12px_32px_-16px_rgba(8,37,32,0.25)]"
        >
            <span
                aria-hidden
                className="absolute inset-x-6 top-0 h-0.5 bg-accent-500 scale-x-0 group-hover:scale-x-100 origin-left rtl:origin-right transition-transform duration-300"
            />

            <div className="flex items-center justify-between gap-3 mb-4">
                <CampaignStatusBadge status={campaign.status} />
                <span className={cn("rounded px-1.5 py-0.5 text-xs font-semibold", tint.bg, tint.text)}>
                    {getCategoryLabel(campaign.category, locale)}
                </span>
            </div>

            <h3 className="text-lg font-bold tracking-tight text-secondary-900 line-clamp-2 transition-colors group-hover:text-primary-700">
                {campaign.title}
            </h3>
            <p className="mt-2 text-sm text-secondary-500 line-clamp-2 leading-relaxed flex-1">
                {campaign.pitch}
            </p>

            <div className="my-5">
                <CampaignOverallProgress percent={overall} />
            </div>

            <div className="pt-4 border-t border-waqf-border flex items-center justify-between text-xs text-secondary-500">
                <span className="truncate">
                    {tCard("by")} <span className="font-medium text-secondary-700">{campaign.owner.name}</span>
                    {campaign.organization?.name && (
                        <span className="text-secondary-400"> · {campaign.organization.name}</span>
                    )}
                </span>
                <span className="flex items-center gap-1 shrink-0 tabular-nums">
                    <Users className="w-3.5 h-3.5" />
                    {tCard("rolesFilled", { filled: filledRoles, total: totalRoles })}
                </span>
            </div>
        </Link>
    );
}
