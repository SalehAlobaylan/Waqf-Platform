import { cn } from "@/lib/utils";

type BadgeTone =
    | "neutral"
    | "green"
    | "gold"
    | "red"
    | "blue";

const toneClasses: Record<BadgeTone, string> = {
    neutral: "bg-secondary-100 text-secondary-700",
    green: "bg-primary-50 text-primary-700",
    gold: "bg-accent-50 text-accent-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    tone?: BadgeTone;
}

export function Badge({
    tone = "neutral",
    className,
    ...props
}: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold",
                toneClasses[tone],
                className
            )}
            {...props}
        />
    );
}

type StatusValue = string;

const statusMap: Record<
    string,
    { tone: BadgeTone; en: string; ar: string }
> = {
    OPEN: { tone: "green", en: "Open", ar: "مفتوح" },
    IN_PROGRESS: { tone: "gold", en: "In progress", ar: "قيد التنفيذ" },
    COMPLETED: { tone: "neutral", en: "Completed", ar: "مكتمل" },
    CLOSED: { tone: "neutral", en: "Closed", ar: "مغلق" },
    PAUSED: { tone: "gold", en: "Paused", ar: "متوقف مؤقتاً" },
    DRAFT: { tone: "neutral", en: "Draft", ar: "مسودة" },
    PENDING: { tone: "gold", en: "Pending", ar: "قيد المراجعة" },
    ACCEPTED: { tone: "green", en: "Accepted", ar: "مقبول" },
    REJECTED: { tone: "red", en: "Rejected", ar: "مرفوض" },
    WITHDRAWN: { tone: "neutral", en: "Withdrawn", ar: "منسحب" },
    APPROVED: { tone: "green", en: "Approved", ar: "معتمد" },
    RECRUITING: { tone: "green", en: "Recruiting", ar: "يستقطب مساهمين" },
    ACTIVE: { tone: "green", en: "Active", ar: "نشط" },
    ARCHIVED: { tone: "neutral", en: "Archived", ar: "مؤرشف" },
};

interface StatusBadgeProps {
    status: StatusValue;
    locale?: string;
    className?: string;
}

export function StatusBadge({ status, locale, className }: StatusBadgeProps) {
    const entry = statusMap[status] ?? {
        tone: "neutral" as BadgeTone,
        en: status,
        ar: status,
    };
    const label = locale === "ar" ? entry.ar : entry.en;
    return (
        <Badge tone={entry.tone} className={className}>
            <span
                aria-hidden
                className={cn(
                    "me-1.5 h-1.5 w-1.5 rounded-full",
                    entry.tone === "green" && "bg-primary-500",
                    entry.tone === "gold" && "bg-accent-500",
                    entry.tone === "red" && "bg-red-500",
                    (entry.tone === "neutral" || entry.tone === "blue") &&
                        "bg-secondary-400"
                )}
            />
            {label}
        </Badge>
    );
}
