"use client";

import { useTranslations } from "next-intl";
import { CampaignStatus } from "@prisma/client";

const STATUS_STYLES: Record<CampaignStatus, string> = {
    DRAFT: "bg-secondary-100 text-secondary-700",
    PENDING: "bg-amber-100 text-amber-800",
    RECRUITING: "bg-primary-100 text-primary-700",
    READY: "bg-emerald-100 text-emerald-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<CampaignStatus, string> = {
    DRAFT: "DRAFT",
    PENDING: "PENDING",
    RECRUITING: "RECRUITING",
    READY: "READY",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
};

const KNOWN_STATUSES = new Set<CampaignStatus>(
    Object.keys(STATUS_STYLES) as CampaignStatus[]
);

interface Props {
    status: CampaignStatus | string;
    className?: string;
}

export function CampaignStatusBadge({ status, className = "" }: Props) {
    const t = useTranslations("campaigns.status");
    const known = KNOWN_STATUSES.has(status as CampaignStatus);
    const style = known
        ? STATUS_STYLES[status as CampaignStatus]
        : "bg-secondary-100 text-secondary-700";
    const label = known ? t(STATUS_LABELS[status as CampaignStatus]) : status;
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${style} ${className}`}>
            {label}
        </span>
    );
}
