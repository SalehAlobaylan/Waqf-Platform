import { ApplicationStatus } from "@prisma/client";
import { Clock, CheckCircle, XCircle, LogOut } from "lucide-react";

interface ApplicationStatusBadgeProps {
    status: ApplicationStatus;
    locale?: string;
}

const statusConfig = {
    PENDING: {
        icon: Clock,
        bgClass: "bg-amber-100",
        textClass: "text-amber-700",
        label: "Pending",
        labelAr: "قيد الانتظار",
    },
    ACCEPTED: {
        icon: CheckCircle,
        bgClass: "bg-green-100",
        textClass: "text-green-700",
        label: "Accepted",
        labelAr: "مقبول",
    },
    REJECTED: {
        icon: XCircle,
        bgClass: "bg-red-100",
        textClass: "text-red-700",
        label: "Rejected",
        labelAr: "مرفوض",
    },
    WITHDRAWN: {
        icon: LogOut,
        bgClass: "bg-secondary-100",
        textClass: "text-secondary-600",
        label: "Withdrawn",
        labelAr: "منسحب",
    },
};

export function ApplicationStatusBadge({ status, locale = "en" }: ApplicationStatusBadgeProps) {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${config.bgClass} ${config.textClass}`}>
            <Icon className="w-3.5 h-3.5" />
            {locale === "ar" ? config.labelAr : config.label}
        </span>
    );
}
