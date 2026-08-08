"use client";

import { ApplicationStatus } from "@prisma/client";
import { Clock, CircleCheck, CircleX, LogOut } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

interface ApplicationStatusBadgeProps {
    status: ApplicationStatus;
    locale?: string;
}

const statusConfig = {
    PENDING: {
        icon: Clock,
        bgClass: "bg-amber-100",
        textClass: "text-amber-700",
    },
    ACCEPTED: {
        icon: CircleCheck,
        bgClass: "bg-green-100",
        textClass: "text-green-700",
    },
    REJECTED: {
        icon: CircleX,
        bgClass: "bg-red-100",
        textClass: "text-red-700",
    },
    WITHDRAWN: {
        icon: LogOut,
        bgClass: "bg-secondary-100",
        textClass: "text-secondary-600",
    },
};

const statusKey: Record<ApplicationStatus, string> = {
    PENDING: "pending",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
    WITHDRAWN: "withdrawn",
};

export function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
    const locale = useLocale();
    const t = useTranslations("applicationDetail");
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${config.bgClass} ${config.textClass}`}>
            <Icon className="w-3.5 h-3.5" />
            {t(statusKey[status])}
        </span>
    );
}
