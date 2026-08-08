"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Search, Loader2, Megaphone } from "lucide-react";
import { CampaignCard, type CampaignCardData } from "@/components/campaigns/CampaignCard";

interface Props {
    initialCampaigns: CampaignCardData[];
    total: number;
    pageSize: number;
}

const CATEGORIES = [
    { value: "QURAN", labelEn: "Quran", labelAr: "القرآن" },
    { value: "PRAYER", labelEn: "Prayer", labelAr: "الصلاة" },
    { value: "CHARITY", labelEn: "Charity", labelAr: "الصداق" },
    { value: "EDUCATION", labelEn: "Education", labelAr: "التعليم" },
    { value: "COMMUNITY", labelEn: "Community", labelAr: "المجتمع" },
    { value: "TOOLS", labelEn: "Tools", labelAr: "الأدوات" },
];

export function CampaignsListClient({ initialCampaigns, total, pageSize }: Props) {
    const locale = useLocale();
    const t = useTranslations("campaigns");
    const isAr = locale === "ar";

    const [campaigns, setCampaigns] = useState(initialCampaigns);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<string | undefined>(undefined);
    const [offset, setOffset] = useState(initialCampaigns.length);
    const [hasMore, setHasMore] = useState(initialCampaigns.length < total);

    const isFirstRun = useRef(true);

    const buildParams = useCallback(
        (extraOffset?: number) => {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (category) params.set("category", category);
            params.set("status", "RECRUITING");
            params.set("limit", String(pageSize));
            params.set("offset", String(extraOffset ?? 0));
            return params;
        },
        [search, category, pageSize]
    );

    const fetchFresh = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/campaigns?${buildParams(0).toString()}`);
            const data = await res.json();
            const list: CampaignCardData[] = data.campaigns ?? [];
            setCampaigns(list);
            setOffset(list.length);
            setHasMore(
                data.pagination?.hasMore ?? (data.pagination?.total ?? list.length) > list.length
            );
        } catch (err) {
            console.error("Error fetching campaigns", err);
        } finally {
            setLoading(false);
        }
    }, [buildParams]);

    const loadMore = async () => {
        try {
            const res = await fetch(`/api/campaigns?${buildParams(offset).toString()}`);
            const data = await res.json();
            const newOnes: CampaignCardData[] = data.campaigns ?? [];
            setCampaigns((prev) => [...prev, ...newOnes]);
            setOffset((prev) => prev + newOnes.length);
            setHasMore(data.pagination?.hasMore ?? newOnes.length >= pageSize);
        } catch (err) {
            console.error("Error loading more", err);
        }
    };

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        const timer = setTimeout(fetchFresh, 300);
        return () => clearTimeout(timer);
    }, [fetchFresh]);

    const clearFilters = () => {
        setSearch("");
        setCategory(undefined);
    };

    const hasFilters = !!search || !!category;

    return (
        <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-10">
            <header className="mb-8 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-600/10 text-primary-700 flex items-center justify-center">
                        <Megaphone className="w-5 h-5" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-secondary-900">
                        {t("title")}
                    </h1>
                </div>
                <p className="text-secondary-600 max-w-2xl">{t("subtitle")}</p>
                <div className="mt-2">
                    <Link
                        href={`/${locale}/campaigns/new`}
                        className="inline-flex items-center gap-2 rounded-xl h-11 px-5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold shadow-sm transition-colors"
                    >
                        <Megaphone className="w-4 h-4" />
                        {t("startCampaign")}
                    </Link>
                </div>
            </header>

            <div className="mb-6 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t("filters.searchPlaceholder")}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-waqf-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                    />
                </div>
                {hasFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-sm text-secondary-500 hover:text-primary-600 self-center"
                    >
                        {t("filters.clear")}
                    </button>
                )}
            </div>

            <div className="mb-8 flex flex-wrap gap-2">
                <FilterChip
                    active={!category}
                    onClick={() => setCategory(undefined)}
                    label={t("filters.all")}
                />
                {CATEGORIES.map((c) => (
                    <FilterChip
                        key={c.value}
                        active={category === c.value}
                        onClick={() => setCategory(c.value)}
                        label={isAr ? c.labelAr : c.labelEn}
                    />
                ))}
            </div>

            {loading && campaigns.length === 0 ? (
                <div className="py-20 flex items-center justify-center text-secondary-500">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    {t("loading")}
                </div>
            ) : campaigns.length === 0 ? (
                <div className="py-20 text-center">
                    <Megaphone className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-secondary-700 mb-2">
                        {t("noCampaigns")}
                    </h2>
                    <p className="text-secondary-500">{t("noCampaignsDescription")}</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {campaigns.map((c) => (
                            <CampaignCard key={c.id} campaign={c} />
                        ))}
                    </div>
                    {hasMore && (
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={loadMore}
                                className="rounded-xl h-11 px-6 border border-waqf-border bg-white hover:bg-secondary-50 text-sm font-semibold text-secondary-700 transition-colors"
                            >
                                {t("loadMore")}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function FilterChip({
    active,
    onClick,
    label,
}: {
    active: boolean;
    onClick: () => void;
    label: string;
}) {
    return (
        <button
            onClick={onClick}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-colors ${
                active
                    ? "bg-primary-600 border-primary-600 text-white"
                    : "bg-white border-waqf-border text-secondary-600 hover:border-primary-300"
            }`}
        >
            {label}
        </button>
    );
}
