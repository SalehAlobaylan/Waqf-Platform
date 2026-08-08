"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
    CircleCheckBig,
    CircleX,
    Clock,
    Star,
    StarOff,
    Trash2,
    Eye,
    Filter,
    Search,
    CircleAlert,
    Loader2,
    X
} from "lucide-react";

interface Project {
    id: string;
    title: string;
    slug: string;
    description: string;
    status: string;
    category: string;
    featured: boolean;
    createdAt: string;
    owner: {
        id: string;
        name: string;
        email: string;
        image: string | null;
    } | null;
    skills: Array<{
        skill: { name: string };
    }>;
    _count: {
        applications: number;
    };
}

interface ProjectReviewQueueProps {
    locale: string;
}

export function ProjectReviewQueue({ locale }: ProjectReviewQueueProps) {
    const searchParams = useSearchParams();
    const initialStatus = searchParams.get("status") || "";

    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState(initialStatus);
    const [searchQuery, setSearchQuery] = useState("");
    const [pagination, setPagination] = useState({
        page: 1,
        total: 0,
        totalPages: 0,
    });
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [feedbackModal, setFeedbackModal] = useState<{
        projectId: string;
        action: "approve" | "reject";
    } | null>(null);
    const [feedback, setFeedback] = useState("");

    const t = useTranslations("admin");
    const tCommon = useTranslations("common");
    const tProjects = useTranslations("projects");
    const isAr = locale === "ar";

    const fetchProjects = useCallback(async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                ...(statusFilter && { status: statusFilter }),
            });

            const response = await fetch(`/api/admin/projects?${params}`);
            if (response.ok) {
                const data = await response.json();
                setProjects(data.projects);
                setPagination(prev => ({
                    ...prev,
                    total: data.pagination.total,
                    totalPages: data.pagination.totalPages,
                }));
            }
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter, pagination.page]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    useEffect(() => {
        if (!feedbackModal) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setFeedbackModal(null);
                setFeedback("");
            }
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [feedbackModal]);

    const handleAction = async (projectId: string, action: string, extraData?: Record<string, unknown>) => {
        try {
            setActionLoading(projectId);
            const response = await fetch(`/api/admin/projects/${projectId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, ...extraData }),
            });

            if (response.ok) {
                fetchProjects();
                setFeedbackModal(null);
                setFeedback("");
            }
        } catch (error) {
            console.error("Failed to perform action:", error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (projectId: string) => {
        if (!confirm(isAr ? "هل أنت متأكد من حذف هذا المشروع؟" : "Are you sure you want to delete this project?")) {
            return;
        }

        try {
            setActionLoading(projectId);
            const response = await fetch(`/api/admin/projects/${projectId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                fetchProjects();
            }
        } catch (error) {
            console.error("Failed to delete project:", error);
        } finally {
            setActionLoading(null);
        }
    };

    const statusOptions = [
        { value: "", label: isAr ? "الكل" : "All" },
        { value: "PENDING", label: tProjects("statusPending") },
        { value: "OPEN", label: tProjects("statusOpen") },
        { value: "DRAFT", label: tProjects("statusDraft") },
        { value: "IN_PROGRESS", label: tProjects("statusInProgress") },
        { value: "COMPLETED", label: tProjects("statusCompleted") },
        { value: "CANCELLED", label: tProjects("statusCancelled") },
    ];

    const filteredProjects = projects.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.owner?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-secondary-900">
                    {t("projects")}
                </h1>
                <p className="text-secondary-500 mt-1">
                    {isAr ? "مراجعة وإدارة جميع المشاريع" : "Review and manage all projects"}
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-secondary-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={isAr ? "بحث..." : "Search..."}
                            className="w-full pl-10 pr-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-secondary-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Projects List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-secondary-200">
                    <CircleAlert className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                    <p className="text-secondary-600">
                        {t("noProjects")}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredProjects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white rounded-xl border border-secondary-200 p-6"
                        >
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                {/* Project Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-secondary-900">
                                            {project.title}
                                        </h3>
                                        <StatusBadge status={project.status} />
                                        {project.featured && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                                                <Star className="w-3 h-3" />
                                                {isAr ? "مميز" : "Featured"}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-secondary-600 line-clamp-2 mb-2">
                                        {project.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-secondary-500">
                                        <span>{isAr ? "المالك:" : "Owner:"} {project.owner?.name ?? "—"}</span>
                                        <span>{project.category}</span>
                                        <span>{project._count.applications} {isAr ? "طلب" : "applications"}</span>
                                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {project.skills.length > 0 && (
                                        <div className="flex gap-2 mt-2">
                                            {project.skills.map((ps, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 bg-secondary-100 text-secondary-600 rounded text-xs"
                                                >
                                                    {ps.skill.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    {project.status === "PENDING" && (
                                        <>
                                            <button
                                                onClick={() => setFeedbackModal({ projectId: project.id, action: "approve" })}
                                                disabled={actionLoading === project.id}
                                                className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                                            >
                                                <CircleCheckBig className="w-4 h-4" />
                                                {t("approve")}
                                            </button>
                                            <button
                                                onClick={() => setFeedbackModal({ projectId: project.id, action: "reject" })}
                                                disabled={actionLoading === project.id}
                                                className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                            >
                                                <CircleX className="w-4 h-4" />
                                                {t("reject")}
                                            </button>
                                        </>
                                    )}

                                    <button
                                        onClick={() => handleAction(project.id, project.featured ? "unfeature" : "feature")}
                                        disabled={actionLoading === project.id}
                                        className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 ${project.featured
                                            ? "bg-secondary-100 text-secondary-700 hover:bg-secondary-200"
                                            : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                            }`}
                                    >
                                        {project.featured ? (
                                            <>
                                                <StarOff className="w-4 h-4" />
                                                {t("unfeature")}
                                            </>
                                        ) : (
                                            <>
                                                <Star className="w-4 h-4" />
                                                {t("feature")}
                                            </>
                                        )}
                                    </button>

                                    <a
                                        href={`/${locale}/projects/${project.slug}`}
                                        target="_blank"
                                        className="flex items-center gap-1 px-3 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        {isAr ? "عرض" : "View"}
                                    </a>

                                    <button
                                        onClick={() => handleDelete(project.id)}
                                        disabled={actionLoading === project.id}
                                        aria-label={t("delete")}
                                        className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                        aria-label={tCommon("previous")}
                        className="px-4 py-2 border border-secondary-200 rounded-lg disabled:opacity-50"
                    >
                        {tCommon("previous")}
                    </button>
                    <span className="text-sm text-secondary-600">
                        {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.totalPages}
                        aria-label={tCommon("next")}
                        className="px-4 py-2 border border-secondary-200 rounded-lg disabled:opacity-50"
                    >
                        {tCommon("next")}
                    </button>
                </div>
            )}

            {/* Feedback Modal */}
            {feedbackModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => {
                        setFeedbackModal(null);
                        setFeedback("");
                    }}
                >
                    <div
                        className="bg-white rounded-2xl p-6 max-w-md w-full relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                setFeedbackModal(null);
                                setFeedback("");
                            }}
                            aria-label={tCommon("cancel")}
                            className="absolute top-3 end-3 p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4 pr-8">
                            {feedbackModal.action === "approve"
                                ? t("confirmApproval")
                                : t("confirmRejection")
                            }
                        </h3>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder={t("addFeedback")}
                            className="w-full p-3 border border-secondary-200 rounded-xl resize-none h-24 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setFeedbackModal(null);
                                    setFeedback("");
                                }}
                                className="flex-1 px-4 py-2 border border-secondary-200 rounded-lg hover:bg-secondary-50"
                            >
                                {tCommon("cancel")}
                            </button>
                            <button
                                onClick={() => handleAction(feedbackModal.projectId, feedbackModal.action, { feedback })}
                                disabled={actionLoading === feedbackModal.projectId}
                                className={`flex-1 px-4 py-2 rounded-lg text-white disabled:opacity-50 ${feedbackModal.action === "approve"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-red-600 hover:bg-red-700"
                                    }`}
                            >
                                {actionLoading === feedbackModal.projectId ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                ) : feedbackModal.action === "approve"
                                    ? t("approve")
                                    : t("reject")
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { icon: React.ElementType; color: string }> = {
        PENDING: { icon: Clock, color: "bg-amber-100 text-amber-700" },
        OPEN: { icon: CircleCheckBig, color: "bg-green-100 text-green-700" },
        DRAFT: { icon: Clock, color: "bg-secondary-100 text-secondary-700" },
        IN_PROGRESS: { icon: Clock, color: "bg-blue-100 text-blue-700" },
        COMPLETED: { icon: CircleCheckBig, color: "bg-primary-100 text-primary-700" },
        CANCELLED: { icon: CircleX, color: "bg-red-100 text-red-700" },
    };

    const { icon: Icon, color } = config[status] || config.PENDING;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${color}`}>
            <Icon className="w-3 h-3" />
            {status}
        </span>
    );
}
