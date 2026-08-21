"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Search, SlidersHorizontal, ChevronDown, Loader2 } from "lucide-react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { FilterSidebar } from "@/components/explore/FilterSidebar";

interface ExplorePageClientProps {
    initialProjects: Array<{
        id: string;
        slug: string;
        title: string;
        description: string;
        category: string;
        status: string;
        timeCommitment: string | null;
        createdAt: Date;
        _count: { applications: number };
        skills: Array<{ skill: { name: string; nameAr: string }; isRequired: boolean }>;
        owner: { name: string; image: string | null };
    }>;
    skills: Array<{ id: number; name: string; nameAr: string; category: string }>;
}

const PAGE_SIZE = 24;

export function ExplorePageClient({ initialProjects, skills }: ExplorePageClientProps) {
    const locale = useLocale();
    const t = useTranslations("search");
    const tLanding = useTranslations("landing");

    const [projects, setProjects] = useState(initialProjects);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(initialProjects.length >= PAGE_SIZE);
    const [offset, setOffset] = useState(initialProjects.length);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("recommended");
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [filters, setFilters] = useState<{
        category?: string;
        skills: string[];
        language?: string;
        timeCommitment?: string;
    }>({ skills: [] });

    const buildParams = useCallback((extraOffset?: number) => {
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        if (filters.category) params.set("category", filters.category);
        if (filters.skills.length) params.set("skills", filters.skills.join(","));
        if (filters.language) params.set("language", filters.language);
        if (filters.timeCommitment) params.set("timeCommitment", filters.timeCommitment);
        params.set("sortBy", sortBy);
        params.set("limit", String(PAGE_SIZE));
        params.set("offset", String(extraOffset ?? 0));
        return params;
    }, [searchQuery, filters.category, filters.skills, filters.language, filters.timeCommitment, sortBy]);

    // Fresh fetch when filters/search/sort change
    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const params = buildParams(0);
            const res = await fetch(`/api/projects?${params.toString()}`);
            const data = await res.json();
            setProjects(data.projects);
            setOffset(data.projects.length);
            setHasMore(data.pagination?.hasMore ?? data.projects.length >= PAGE_SIZE);
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoading(false);
        }
    }, [buildParams]);

    // Load More
    const loadMore = async () => {
        setLoadingMore(true);
        try {
            const params = buildParams(offset);
            const res = await fetch(`/api/projects?${params.toString()}`);
            const data = await res.json();
            const newProjects = data.projects;
            setProjects(prev => [...prev, ...newProjects]);
            setOffset(prev => prev + newProjects.length);
            setHasMore(data.pagination?.hasMore ?? newProjects.length >= PAGE_SIZE);
        } catch (error) {
            console.error("Error loading more projects:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    // Skip the initial mount fetch: the server already rendered the same
    // default query (no filters, sortBy=recommended, offset 0) as
    // initialProjects. Refetch only when filters/search/sort actually change.
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const timer = setTimeout(fetchProjects, 300);
        return () => clearTimeout(timer);
    }, [fetchProjects]);

    return (
        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Filters */}
            <FilterSidebar
                filters={filters}
                onFilterChange={setFilters}
                skills={skills}
                locale={locale}
            />

            {/* Main Content */}
            <main className="flex-1 h-[calc(100vh-65px)] overflow-y-auto bg-waqf-bg">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* Header Section */}
                    <div className="mb-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-secondary-900 mb-2">
                                    {locale === "ar" ? "استكشف الفرص" : "Explore Opportunities"}
                                </h1>
                                <p className="text-waqf-muted">
                                    {t("searchPlaceholder")}
                                </p>
                            </div>
                            <p className="hidden md:block text-sm tabular-nums text-secondary-500">
                                {projects.length} {tLanding("activeProjects")}
                            </p>
                        </div>

                        {/* Search & Sort */}
                        <div className="flex flex-col md:flex-row gap-3">
                            {/* Search Bar */}
                            <div className="relative flex-1">
                                <div className={`absolute inset-y-0 ${locale === "ar" ? "right-0 pr-3" : "left-0 pl-3"} flex items-center pointer-events-none`}>
                                    <Search className="w-5 h-5 text-waqf-muted" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`block w-full ${locale === "ar" ? "pr-10 pl-3" : "pl-10 pr-3"} py-2.5 border border-waqf-border rounded-md leading-5 bg-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm transition-colors`}
                                    placeholder={t("searchPlaceholder")}
                                />
                            </div>

                            {/* Sort Dropdown */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="block w-full md:w-[180px] py-2.5 px-3 text-sm border border-waqf-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer transition-colors"
                            >
                                <option value="recommended">{locale === "ar" ? "موصى به" : "Recommended"}</option>
                                <option value="newest">{locale === "ar" ? "الأحدث" : "Newest First"}</option>
                                <option value="oldest">{locale === "ar" ? "الأقدم" : "Oldest First"}</option>
                            </select>

                            {/* Mobile Filter Toggle */}
                            <button
                                onClick={() => setShowMobileFilters(!showMobileFilters)}
                                className="lg:hidden flex items-center justify-center px-4 py-2.5 border border-waqf-border rounded-md bg-white text-secondary-900"
                            >
                                <SlidersHorizontal className={`w-4 h-4 ${locale === "ar" ? "me-2" : "mr-2"}`} />
                                {locale === "ar" ? "التصفية" : "Filters"}
                            </button>
                        </div>
                    </div>

                    {/* Projects Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-20 rounded-lg border border-waqf-border bg-white">
                            <p className="text-secondary-500">
                                {locale === "ar"
                                    ? "لم يتم العثور على مشاريع"
                                    : "No projects found"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {projects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    locale={locale}
                                />
                            ))}
                        </div>
                    )}

                    {/* Load More */}
                    {!loading && projects.length > 0 && (
                        <div className="mt-12 flex justify-center">
                            {hasMore ? (
                                <button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="flex items-center gap-2 px-6 py-2.5 border border-waqf-border rounded-md bg-white text-secondary-900 font-semibold hover:bg-secondary-50 transition-colors disabled:opacity-50"
                                >
                                    {loadingMore ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5" />
                                    )}
                                    {locale === "ar" ? "تحميل المزيد" : "Load More Projects"}
                                </button>
                            ) : (
                                <p className="text-sm text-secondary-400">
                                    {locale === "ar" ? "لا توجد مشاريع أخرى" : "No more projects to show"}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
