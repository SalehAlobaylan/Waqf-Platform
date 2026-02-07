"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Search, SlidersHorizontal, Grid, List } from "lucide-react";
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
        owner: { name: string; avatar: string | null };
    }>;
    skills: Array<{ id: number; name: string; nameAr: string; category: string }>;
}

export function ExplorePageClient({ initialProjects, skills }: ExplorePageClientProps) {
    const locale = useLocale();
    const t = useTranslations("explore");

    const [projects, setProjects] = useState(initialProjects);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
    const [showFilters, setShowFilters] = useState(true);
    const [filters, setFilters] = useState<{
        category?: string;
        skills: string[];
        language?: string;
        timeCommitment?: string;
    }>({ skills: [] });

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.set("search", searchQuery);
            if (filters.category) params.set("category", filters.category);
            if (sortBy) params.set("sortBy", sortBy);
            params.set("limit", "24");

            const res = await fetch(`/api/projects?${params.toString()}`);
            const data = await res.json();
            setProjects(data.projects);
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, filters.category, sortBy]);

    useEffect(() => {
        const timer = setTimeout(fetchProjects, 300);
        return () => clearTimeout(timer);
    }, [fetchProjects]);

    return (
        <div className="min-h-screen bg-secondary-50">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
                <div className="container max-w-7xl mx-auto px-4 py-12">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        {locale === "ar" ? "استكشف المشاريع" : "Explore Projects"}
                    </h1>
                    <p className="text-white/80 text-lg max-w-2xl">
                        {locale === "ar"
                            ? "اكتشف فرص المساهمة في المشاريع الإسلامية مفتوحة المصدر"
                            : "Discover opportunities to contribute to Islamic open-source projects as sadaqah jariyah"}
                    </p>

                    {/* Search */}
                    <div className="mt-8 max-w-xl">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={locale === "ar" ? "ابحث عن مشاريع..." : "Search projects..."}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:bg-white/20 focus:border-white/40 focus:outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container max-w-7xl mx-auto px-4 py-8">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-secondary-200 rounded-lg bg-white text-secondary-700 hover:bg-secondary-50"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            {locale === "ar" ? "التصفية" : "Filters"}
                        </button>
                        <span className="text-sm text-secondary-600">
                            {projects.length} {locale === "ar" ? "مشروع" : "projects"}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
                            className="px-4 py-2 border border-secondary-200 rounded-lg bg-white text-secondary-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="newest">{locale === "ar" ? "الأحدث" : "Newest"}</option>
                            <option value="oldest">{locale === "ar" ? "الأقدم" : "Oldest"}</option>
                        </select>
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filter Sidebar */}
                    <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
                        <FilterSidebar
                            filters={filters}
                            onFilterChange={setFilters}
                            skills={skills}
                            locale={locale}
                        />
                    </div>

                    {/* Projects Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-secondary-100">
                                <p className="text-secondary-600">
                                    {locale === "ar"
                                        ? "لم يتم العثور على مشاريع"
                                        : "No projects found"}
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {projects.map((project) => (
                                    <ProjectCard
                                        key={project.id}
                                        // @ts-expect-error - Type mismatch for project props, safe to ignore
                                        project={project}
                                        locale={locale}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
