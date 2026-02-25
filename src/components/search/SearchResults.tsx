"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, Loader2, ArrowUpDown } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";
import { ProjectCard } from "@/components/projects/ProjectCard";

interface SearchResult {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: string;
    status: string;
    timeCommitment: string | null;
    createdAt: string;
    skills: {
        skill: { name: string; nameAr: string | null };
        isRequired: boolean;
    }[];
    owner: {
        id: string;
        name: string;
        image: string | null;
    };
    _count: {
        applications: number;
    };
}

const categories = [
    { value: "", label: "All Categories", labelAr: "جميع الفئات" },
    { value: "QURAN", label: "Quran", labelAr: "القرآن" },
    { value: "PRAYER", label: "Prayer", labelAr: "الصلاة" },
    { value: "CHARITY", label: "Charity", labelAr: "الصدقة" },
    { value: "EDUCATION", label: "Education", labelAr: "التعليم" },
    { value: "COMMUNITY", label: "Community", labelAr: "المجتمع" },
    { value: "TOOLS", label: "Tools", labelAr: "أدوات" },
];

const sortOptions = [
    { value: "relevance", label: "Relevance", labelAr: "الصلة" },
    { value: "newest", label: "Newest", labelAr: "الأحدث" },
    { value: "oldest", label: "Oldest", labelAr: "الأقدم" },
];

export function SearchResults() {
    const t = useTranslations("search");
    const locale = useLocale();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [results, setResults] = useState<SearchResult[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [query, setQuery] = useState(searchParams.get("q") || "");
    const [category, setCategory] = useState(searchParams.get("category") || "");
    const [sortBy, setSortBy] = useState("relevance");

    const fetchResults = useCallback(async (searchQuery: string) => {
        if (!searchQuery || searchQuery.length < 2) {
            setResults([]);
            setTotal(0);
            return;
        }

        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                q: searchQuery,
                ...(category && { category }),
            });

            const response = await fetch(`/api/search?${params}`);
            const data = await response.json();

            if (response.ok) {
                let sortedResults = data.projects || [];

                // Client-side sorting
                if (sortBy === "newest") {
                    sortedResults = sortedResults.sort((a: SearchResult, b: SearchResult) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                } else if (sortBy === "oldest") {
                    sortedResults = sortedResults.sort((a: SearchResult, b: SearchResult) =>
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    );
                }

                setResults(sortedResults);
                setTotal(data.total || 0);
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoading(false);
        }
    }, [category, sortBy]);

    // Fetch on mount and when search params change
    useEffect(() => {
        const q = searchParams.get("q");
        if (q) {
            setQuery(q);
            fetchResults(q);
        }
    }, [searchParams, fetchResults]);

    const handleSearch = (newQuery: string) => {
        setQuery(newQuery);
        router.push(`/${locale}/search?q=${encodeURIComponent(newQuery)}${category ? `&category=${category}` : ""}`);
        fetchResults(newQuery);
    };

    const handleCategoryChange = (newCategory: string) => {
        setCategory(newCategory);
        if (query) {
            router.push(`/${locale}/search?q=${encodeURIComponent(query)}${newCategory ? `&category=${newCategory}` : ""}`);
            fetchResults(query);
        }
    };

    return (
        <div className="min-h-screen bg-secondary-50">
            {/* Search Header */}
            <div className="bg-white border-b border-secondary-100 sticky top-0 z-10">
                <div className="container max-w-5xl mx-auto px-4 py-6">
                    <SearchBar
                        variant="page"
                        onSearch={handleSearch}
                        placeholder={t("searchPlaceholder")}
                    />

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-secondary-500" />
                            <select
                                value={category}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="px-3 py-1.5 text-sm bg-secondary-100 border-0 rounded-lg 
                                           text-secondary-700 focus:ring-2 focus:ring-primary-200"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {locale === "ar" ? cat.labelAr : cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-4 h-4 text-secondary-500" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-1.5 text-sm bg-secondary-100 border-0 rounded-lg 
                                           text-secondary-700 focus:ring-2 focus:ring-primary-200"
                            >
                                {sortOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {locale === "ar" ? opt.labelAr : opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {query && (
                            <span className="text-sm text-secondary-500 ml-auto">
                                {total} {total === 1 ? t("result") : t("results")}
                                {query && ` ${t("for")} "${query}"`}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="container max-w-5xl mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
                        <p className="text-secondary-500">{t("searching")}</p>
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        {results.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={{
                                    ...project,
                                    createdAt: new Date(project.createdAt),
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                } as any}
                                locale={locale}
                            />
                        ))}
                    </div>
                ) : query ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 rounded-full flex items-center justify-center">
                            <Search className="w-8 h-8 text-secondary-400" />
                        </div>
                        <h3 className="text-lg font-medium text-secondary-900 mb-2">
                            {t("noResults")}
                        </h3>
                        <p className="text-secondary-500 max-w-md mx-auto">
                            {t("noResultsDescription")}
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                            <Search className="w-8 h-8 text-primary-500" />
                        </div>
                        <h3 className="text-lg font-medium text-secondary-900 mb-2">
                            {t("startSearching")}
                        </h3>
                        <p className="text-secondary-500 max-w-md mx-auto">
                            {t("startSearchingDescription")}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
