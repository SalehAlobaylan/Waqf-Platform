import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CampaignStatus, CampaignRoleStatus } from "@prisma/client";
import { ChevronRight, CircleCheck, MapPin, Mail, Calendar, Users, Megaphone } from "lucide-react";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { CampaignOverallProgress, ProgressBar } from "@/components/campaigns/ProgressBar";
import { JoinModal } from "@/components/campaigns/JoinModal";
import { MilestoneList } from "@/components/campaigns/MilestoneList";
import { PromoteBanner } from "@/components/campaigns/PromoteBanner";
import { getCampaignProgress } from "@/lib/campaigns/progress";

interface Props {
    params: Promise<{ locale: string; slug: string }>;
}

const CATEGORY_LABELS: Record<string, { en: string; ar: string }> = {
    QURAN: { en: "Quran", ar: "القرآن" },
    PRAYER: { en: "Prayer", ar: "الصلاة" },
    CHARITY: { en: "Charity", ar: "الصدقة" },
    EDUCATION: { en: "Education", ar: "التعليم" },
    COMMUNITY: { en: "Community", ar: "المجتمع" },
    TOOLS: { en: "Tools", ar: "الأدوات" },
};

const CATEGORY_BG: Record<string, string> = {
    QURAN: "from-indigo-500/10 to-indigo-500/5",
    PRAYER: "from-emerald-500/10 to-emerald-500/5",
    CHARITY: "from-amber-500/10 to-amber-500/5",
    EDUCATION: "from-blue-500/10 to-blue-500/5",
    COMMUNITY: "from-purple-500/10 to-purple-500/5",
    TOOLS: "from-slate-500/10 to-slate-500/5",
};

const SENIORITY_LABELS: Record<string, { en: string; ar: string }> = {
    JUNIOR: { en: "Junior", ar: "مبتدئ" },
    MID: { en: "Mid", ar: "متوسط" },
    SENIOR: { en: "Senior", ar: "أول" },
    ANY: { en: "Any", ar: "أي مستوى" },
};

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    const c = await prisma.campaign.findUnique({
        where: { slug },
        select: { title: true, pitch: true },
    });
    return {
        title: c ? `${c.title} | Waqf` : "Campaign | Waqf",
        description: c?.pitch?.slice(0, 160) || "Campaign on Waqf",
    };
}

export default async function CampaignDetailPage({ params }: Props) {
    const { locale, slug } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    const t = await getTranslations({ locale, namespace: "campaigns" });
    const isAr = locale === "ar";

    const campaign = await prisma.campaign.findUnique({
        where: { slug },
        include: {
            owner: { select: { id: true, name: true, username: true, image: true } },
            organization: { select: { id: true, name: true, logo: true, verified: true } },
            roles: { include: { skill: true }, orderBy: { createdAt: "asc" } },
            milestones: { orderBy: { order: "asc" } },
            joins: {
                include: {
                    contributor: { select: { id: true, name: true, image: true, username: true } },
                    role: { select: { id: true, title: true } },
                },
                orderBy: { createdAt: "asc" },
            },
            promotedProject: { select: { slug: true, title: true } },
        },
    });

    if (!campaign) {
        notFound();
    }

    const isOwner = session?.user?.id === campaign.ownerId;
    const PUBLIC_STATUSES: CampaignStatus[] = [
        CampaignStatus.RECRUITING,
        CampaignStatus.READY,
        CampaignStatus.COMPLETED,
    ];
    const isPubliclyVisible = PUBLIC_STATUSES.includes(campaign.status);
    if (!isPubliclyVisible && !isOwner) {
        notFound();
    }

    const progress = await getCampaignProgress(campaign.id);
    const acceptedJoins = campaign.joins.filter((j) => j.status === "ACCEPTED");
    const pendingJoins = campaign.joins.filter((j) => j.status === "PENDING");
    const myJoins = session?.user?.id
        ? campaign.joins.filter((j) => j.contributorId === session.user.id)
        : [];
    const myJoinedRoleIds = myJoins.map((j) => j.campaignRoleId);

    const grad = CATEGORY_BG[campaign.category] ?? "from-primary-500/10 to-primary-500/5";
    const catLabel = CATEGORY_LABELS[campaign.category];

    return (
        <div className="min-h-screen bg-waqf-bg">
            <div className="max-w-[1280px] mx-auto px-4 md:px-10 pt-6">
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-secondary-500">
                    <Link href={`/${locale}/campaigns`} className="hover:text-primary-600 transition-colors">
                        {t("detail.breadcrumbs.campaigns")}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    <span className="text-secondary-700 font-medium truncate max-w-xs">{campaign.title}</span>
                </nav>
            </div>

            <article className="max-w-[1280px] mx-auto px-4 md:px-10 py-8 space-y-6">
                <header className="rounded-3xl overflow-hidden border border-waqf-border bg-white">
                    <div className={`h-40 md:h-56 bg-gradient-to-br ${grad} flex items-center justify-center relative`}>
                        <Megaphone className="w-20 h-20 text-primary-600/20" strokeWidth={1} />
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                            <CampaignStatusBadge status={campaign.status} />
                            {catLabel && (
                                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-white/90 text-secondary-700">
                                    {isAr ? catLabel.ar : catLabel.en}
                                </span>
                            )}
                        </div>
                        {campaign.organization?.name && (
                            <div className="absolute top-4 right-4 max-w-[60%] truncate rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-secondary-700">
                                {campaign.organization.name}
                            </div>
                        )}
                    </div>

                    <div className="p-6 md:p-8">
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-secondary-900 mb-3">
                            {campaign.title}
                        </h1>
                        <p className="text-lg text-secondary-700 mb-6 leading-relaxed">
                            {campaign.pitch}
                        </p>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-secondary-600 mb-6">
                            <div className="flex items-center gap-1.5">
                                <span className="font-medium">{isAr ? "بواسطة" : "by"}</span>
                                <span className="font-semibold text-secondary-800">{campaign.owner.name}</span>
                                <CircleCheck className="w-3.5 h-3.5 text-primary-600" />
                            </div>
                            {campaign.country && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    {campaign.country}
                                </div>
                            )}
                            {campaign.contactEmail && (
                                <div className="flex items-center gap-1.5">
                                    <Mail className="w-4 h-4" />
                                    <a
                                        href={`mailto:${campaign.contactEmail}`}
                                        className="hover:text-primary-600 underline"
                                    >
                                        {campaign.contactEmail}
                                    </a>
                                </div>
                            )}
                            {campaign.recruitmentDeadline && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(campaign.recruitmentDeadline).toLocaleDateString(isAr ? "ar" : "en")}
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <CampaignOverallProgress percent={progress.overallPercent} />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {!isOwner && campaign.status === CampaignStatus.RECRUITING && (
                                <JoinModal
                                    campaignId={campaign.id}
                                    campaignSlug={campaign.slug}
                                    roles={campaign.roles.map((r) => ({
                                        id: r.id,
                                        title: r.title,
                                        description: r.description,
                                        count: r.count,
                                        filledCount: r.filledCount,
                                        status: r.status as CampaignRoleStatus,
                                        skill: r.skill,
                                    }))}
                                    isAuthed={!!session?.user?.id}
                                    isOwner={isOwner}
                                    alreadyJoinedRoleIds={myJoinedRoleIds}
                                />
                            )}
                            {isOwner && (
                                <Link
                                    href={`/${locale}/campaigns/${campaign.slug}/edit`}
                                    className="rounded-xl h-11 px-5 border border-waqf-border bg-white hover:bg-secondary-50 text-secondary-700 text-sm font-bold"
                                >
                                    {t("detail.edit")}
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                <PromoteBanner
                    campaignId={campaign.id}
                    projectSlug={campaign.promotedProject?.slug ?? null}
                    isReadyEligible={progress.isReadyEligible}
                    isOwner={isOwner}
                    status={campaign.status}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <section className="rounded-2xl border border-waqf-border bg-white p-6">
                            <h2 className="text-lg font-bold text-secondary-900 mb-3">
                                {t("detail.problem")}
                            </h2>
                            <p className="text-secondary-700 whitespace-pre-wrap leading-relaxed">
                                {campaign.problem}
                            </p>
                            {campaign.outcome && (
                                <>
                                    <h2 className="text-lg font-bold text-secondary-900 mb-3 mt-6">
                                        {t("detail.outcome")}
                                    </h2>
                                    <p className="text-secondary-700 whitespace-pre-wrap leading-relaxed">
                                        {campaign.outcome}
                                    </p>
                                </>
                            )}
                        </section>

                        <section className="rounded-2xl border border-waqf-border bg-white p-6">
                            <h2 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary-600" />
                                {t("detail.rolesHeading")}
                            </h2>
                            {campaign.roles.length === 0 ? (
                                <p className="text-sm text-secondary-500 italic">{t("detail.noRoles")}</p>
                            ) : (
                                <div className="space-y-3">
                                    {campaign.roles.map((r) => {
                                        const full = r.filledCount >= r.count;
                                        return (
                                            <div
                                                key={r.id}
                                                className="rounded-xl border border-waqf-border bg-waqf-bg/40 p-4"
                                            >
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <div>
                                                        <h3 className="font-bold text-secondary-900">
                                                            {r.title}
                                                        </h3>
                                                        <p className="text-xs text-secondary-500">
                                                            {isAr
                                                                ? r.skill.nameAr ?? r.skill.name
                                                                : r.skill.name}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                            r.status === "FILLED" || full
                                                                ? "bg-emerald-100 text-emerald-700"
                                                                : r.status === "CLOSED"
                                                                    ? "bg-secondary-200 text-secondary-600"
                                                                    : "bg-primary-100 text-primary-700"
                                                        }`}
                                                    >
                                                        {r.status === "FILLED" || full
                                                            ? t("roles.filled")
                                                            : r.status === "CLOSED"
                                                                ? t("roles.closed")
                                                                : t("roles.open")}
                                                    </span>
                                                </div>
                                                {r.description && (
                                                    <p className="text-sm text-secondary-600 mb-2">
                                                        {r.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center justify-between text-xs text-secondary-500 mb-1">
                                                    <span>
                                                        {t("roles.seniority")}:{" "}
                                                        {isAr
                                                            ? SENIORITY_LABELS[r.seniority]?.ar
                                                            : SENIORITY_LABELS[r.seniority]?.en}
                                                    </span>
                                                    <span className="font-semibold">
                                                        {Math.min(r.filledCount, r.count)}/{r.count}
                                                    </span>
                                                </div>
                                                <ProgressBar
                                                    filled={r.filledCount}
                                                    total={r.count}
                                                    showCount={false}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <section className="rounded-2xl border border-waqf-border bg-white p-6">
                            <MilestoneList
                                campaignId={campaign.id}
                                initialMilestones={campaign.milestones.map((m) => ({
                                    id: m.id,
                                    title: m.title,
                                    description: m.description,
                                    isDone: m.isDone,
                                }))}
                                canEdit={isOwner}
                            />
                        </section>

                        {acceptedJoins.length > 0 && (
                            <section className="rounded-2xl border border-waqf-border bg-white p-6">
                                <h2 className="text-lg font-bold text-secondary-900 mb-4">
                                    {isAr ? "الفريق" : "Team"}
                                </h2>
                                <ul className="space-y-2">
                                    {acceptedJoins.map((j) => (
                                        <li
                                            key={j.id}
                                            className="flex items-center gap-3 text-sm"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                {j.contributor.name?.[0]?.toUpperCase() ?? "?"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-secondary-800 truncate">
                                                    {j.contributor.name}
                                                </p>
                                                <p className="text-xs text-secondary-500 truncate">
                                                    {j.role.title}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>

                    <aside className="space-y-6">
                        <section className="rounded-2xl border border-waqf-border bg-white p-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-primary-700 mb-3">
                                {t("detail.ownerHeading")}
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                                    {campaign.owner.name?.[0]?.toUpperCase() ?? "?"}
                                </div>
                                <div>
                                    <p className="font-semibold text-secondary-900">
                                        {campaign.owner.name}
                                    </p>
                                    {campaign.owner.username && (
                                        <p className="text-xs text-secondary-500">
                                            @{campaign.owner.username}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {campaign.organization && (
                            <section className="rounded-2xl border border-waqf-border bg-white p-6">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-primary-700 mb-3">
                                    {t("detail.organizationHeading")}
                                </h3>
                                <div className="flex items-center gap-3">
                                    {campaign.organization.logo ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={campaign.organization.logo}
                                            alt={campaign.organization.name}
                                            className="w-12 h-12 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                                            {campaign.organization.name[0]?.toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-secondary-900">
                                            {campaign.organization.name}
                                        </p>
                                        {campaign.organization.verified && (
                                            <span className="inline-flex items-center gap-1 text-xs text-primary-700">
                                                <CircleCheck className="w-3 h-3" />
                                                {isAr ? "موثوق" : "Verified"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}

                        <section className="rounded-2xl border border-waqf-border bg-white p-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-primary-700 mb-3">
                                {isAr ? "ملخص التقدم" : "Progress snapshot"}
                            </h3>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-secondary-600">
                                        {isAr ? "الأدوار المملوءة" : "Roles filled"}
                                    </dt>
                                    <dd className="font-semibold">
                                        {progress.filledRoles}/{progress.totalRoles}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-secondary-600">
                                        {isAr ? "المقاعد المملوءة" : "Seats filled"}
                                    </dt>
                                    <dd className="font-semibold">
                                        {progress.filledSeats}/{progress.totalSeats}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-secondary-600">
                                        {isAr ? "المراحل المنجزة" : "Milestones done"}
                                    </dt>
                                    <dd className="font-semibold">
                                        {progress.doneMilestones}/{progress.totalMilestones}
                                    </dd>
                                </div>
                                {pendingJoins.length > 0 && (
                                    <div className="flex justify-between">
                                        <dt className="text-secondary-600">
                                            {isAr ? "طلبات معلقة" : "Pending joins"}
                                        </dt>
                                        <dd className="font-semibold">{pendingJoins.length}</dd>
                                    </div>
                                )}
                            </dl>
                        </section>
                    </aside>
                </div>
            </article>
        </div>
    );
}
