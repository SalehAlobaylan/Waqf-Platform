"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Search, Star, Trash2, Calendar, Loader2 } from "lucide-react";

interface FeaturedProject {
    id: string;
    title: string;
    slug: string;
    category: string;
    featured: boolean;
    featuredUntil: string | null;
    source?: string;
    owner: { id: string; name: string } | null;
}

interface SearchResult {
    id: string;
    title: string;
    slug: string;
    category: string;
    source?: string;
    owner: { id: string; name: string } | null;
}

export function FeaturedCuration() {
    const t = useTranslations("featured");
    const [featured, setFeatured] = useState<FeaturedProject[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchFeatured = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/featured");
            const data = await res.json();
            setFeatured(data.projects || []);
        } catch (error) {
            console.error("Error fetching featured:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeatured();
    }, []);

    // Search for projects to feature
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(`/api/projects?search=${encodeURIComponent(searchQuery)}&limit=6`);
                const data = await res.json();
                const projects = data.projects || [];
                // Exclude already featured
                const featuredIds = new Set(featured.map(f => f.id));
                setSearchResults(projects.filter((p: SearchResult) => !featuredIds.has(p.id)));
            } catch (error) {
                console.error("Error searching projects:", error);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, featured]);

    const toggleFeatured = async (projectId: string, shouldFeature: boolean) => {
        setActionLoading(projectId);
        try {
            const featuredUntil = shouldFeature
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                : null;

            const res = await fetch("/api/admin/featured", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId, featured: shouldFeature, featuredUntil }),
            });

            if (res.ok) {
                fetchFeatured();
                setSearchQuery("");
            }
        } catch (error) {
            console.error("Error toggling featured:", error);
        } finally {
            setActionLoading(null);
        }
    };

    const categoryEmojis: Record<string, string> = {
        QURAN: "📖",
        PRAYER: "🕌",
        CHARITY: "🤲",
        EDUCATION: "📚",
        COMMUNITY: "👥",
        TOOLS: "⚙️",
    };

    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-secondary-400" />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("searchProject")}
                    className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl text-sm bg-white focus:ring-1 focus:ring-primary-600 focus:border-primary-600 shadow-sm"
                />
                {searching && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <Loader2 className="w-4 h-4 animate-spin text-secondary-400" />
                    </div>
                )}

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white rounded-xl border border-secondary-200 shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map(project => (
                            <button
                                key={project.id}
                                onClick={() => toggleFeatured(project.id, true)}
                                disabled={actionLoading === project.id}
                                className="w-full flex items-center gap-3 p-3 text-left hover:bg-primary-50 transition-colors border-b border-secondary-50 last:border-b-0"
                            >
                                <span className="text-lg">{categoryEmojis[project.category] || "📦"}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-secondary-900 truncate">{project.title}</p>
                                    <p className="text-xs text-secondary-400">
                                        {project.owner?.name ?? (project.source === "EXTERNAL" ? "Curated" : "—")}
                                    </p>
                                </div>
                                <Star className="w-4 h-4 text-amber-400 shrink-0" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Currently Featured */}
            <div>
                <h3 className="text-sm font-semibold text-secondary-700 mb-3">{t("currentlyFeatured")}</h3>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                    </div>
                ) : featured.length === 0 ? (
                    <div className="bg-white rounded-xl border border-secondary-100 p-8 text-center">
                        <Star className="w-10 h-10 text-secondary-300 mx-auto mb-2" />
                        <p className="text-sm text-secondary-500">{t("noFeatured")}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {featured.map(project => (
                            <div key={project.id} className="bg-white rounded-xl border border-secondary-100 p-4 flex items-center gap-4">
                                <span className="text-xl">{categoryEmojis[project.category] || "📦"}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-secondary-900 truncate">{project.title}</p>
                                    <div className="flex items-center gap-2 text-xs text-secondary-400 mt-0.5">
                                        <span>{project.owner?.name ?? (project.source === "EXTERNAL" ? "Curated" : "—")}</span>
                                        {project.featuredUntil && (
                                            <>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {t("featuredUntil")} {new Date(project.featuredUntil).toLocaleDateString()}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleFeatured(project.id, false)}
                                    disabled={actionLoading === project.id}
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title={t("removeFromFeatured")}
                                >
                                    {actionLoading === project.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
