"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
    Plus,
    SquareArrowOutUpRight,
    Pencil,
    Trash2,
    Loader2,
    Search,
    Star,
    CircleAlert,
    ArrowLeft,
    CircleCheckBig,
    EyeOff
} from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { toast } from "@/lib/toast";
import { translateApiError } from "@/lib/i18n/client-errors";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface CuratedProject {
    id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    status: string;
    featured: boolean;
    externalUrl: string;
    externalOwnerName: string;
    externalOwnerContact: string;
    curatorNotes: string | null;
    createdAt: string;
    addedByAdmin: { id: string; name: string; email: string } | null;
    skills: Array<{ skill: { name: string } }>;
    _count: { applications: number };
}

interface CuratedProjectsListProps {
    locale: string;
}

export function CuratedProjectsList({ locale }: CuratedProjectsListProps) {
    const isAr = locale === "ar";

    const [projects, setProjects] = useState<CuratedProject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 0, total: 0 });
    const [deleteTarget, setDeleteTarget] = useState<CuratedProject | null>(null);
    const [publishTarget, setPublishTarget] = useState<{
        project: CuratedProject;
        nextStatus: "OPEN" | "DRAFT";
    } | null>(null);

    const tGlobal = useTranslations();
    const tCommon = useTranslations("common");

    const fetchProjects = useCallback(async (page = 1) => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/admin/curated-projects?page=${page}&limit=20`);
            if (res.ok) {
                const data = await res.json();
                setProjects(data.projects);
                setPagination({
                    page: data.pagination.page,
                    totalPages: data.pagination.totalPages,
                    total: data.pagination.total,
                });
            }
        } catch (error) {
            console.error("Failed to fetch curated projects:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects(1);
    }, [fetchProjects]);

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setActionLoading(deleteTarget.id);
        try {
            await apiFetch(`/api/admin/curated-projects/${deleteTarget.id}`, { method: "DELETE" });
            setDeleteTarget(null);
            fetchProjects(pagination.page);
        } catch (error) {
            toast.error(translateApiError(tGlobal, error));
            throw error;
        } finally {
            setActionLoading(null);
        }
    };

    const handlePublishConfirm = async () => {
        if (!publishTarget) return;
        setActionLoading(publishTarget.project.id);
        try {
            await apiFetch(`/api/admin/curated-projects/${publishTarget.project.id}`, {
                method: "PATCH",
                body: { status: publishTarget.nextStatus },
            });
            setPublishTarget(null);
            fetchProjects(pagination.page);
        } catch (error) {
            toast.error(translateApiError(tGlobal, error));
            throw error;
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = projects.filter(
        (p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.externalOwnerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-secondary-500 mb-1">
                        <Link
                            href={`/${locale}/admin/projects`}
                            className="hover:text-primary-600 transition-colors inline-flex items-center gap-1"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                            {isAr ? "المشاريع" : "Projects"}
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold text-secondary-900">
                        {isAr ? "مشاريع منتقاة" : "Curated External Projects"}
                    </h1>
                    <p className="text-secondary-500 mt-1">
                        {isAr
                            ? "مشاريع خارجية مُضافة بالنيابة عن أصحابها غير المسجلين على المنصة"
                            : "External projects added on behalf of owners who are not on the platform"}
                    </p>
                </div>
                <Link
                    href={`/${locale}/admin/projects/curated/new`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-sm shadow-primary-600/20"
                >
                    <Plus className="w-4 h-4" />
                    {isAr ? "مشروع منتقى جديد" : "New Curated Project"}
                </Link>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl border border-secondary-200 p-4">
                <div className="relative">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={isAr ? "بحث بالعنوان أو اسم المالك..." : "Search by title or owner name..."}
                        className="w-full ps-10 pe-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-secondary-200">
                    <CircleAlert className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                    <p className="text-secondary-600 mb-4">
                        {searchQuery
                            ? isAr
                                ? "لا توجد نتائج"
                                : "No results"
                            : isAr
                                ? "لا توجد مشاريع منتقاة بعد"
                                : "No curated projects yet"}
                    </p>
                    <Link
                        href={`/${locale}/admin/projects/curated/new`}
                        className="inline-flex items-center gap-2 text-sm text-primary-600 hover:underline"
                    >
                        <Plus className="w-4 h-4" />
                        {isAr ? "أضف أول مشروع منتقى" : "Add the first curated project"}
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white rounded-xl border border-secondary-200 p-6"
                        >
                            <div className="flex flex-col md:flex-row md:items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                        <h3 className="font-semibold text-secondary-900 truncate">
                                            {project.title}
                                        </h3>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                            <Globe2Mini />
                                            {isAr ? "خارجي" : "External"}
                                        </span>
                                        <ProjectStatusBadge status={project.status} isAr={isAr} />
                                        {project.featured && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                                                <Star className="w-3 h-3" />
                                                {isAr ? "مميز" : "Featured"}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-secondary-600 line-clamp-2 mb-3">
                                        {project.description}
                                    </p>
                                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-secondary-500">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-secondary-400">{isAr ? "المالك:" : "Owner:"}</span>
                                            <span className="font-medium text-secondary-700">{project.externalOwnerName}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 truncate">
                                            <span className="text-secondary-400">{isAr ? "التواصل:" : "Contact:"}</span>
                                            <span className="font-medium text-secondary-700 truncate">{project.externalOwnerContact}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 sm:col-span-2 truncate">
                                            <SquareArrowOutUpRight className="w-3.5 h-3.5 text-secondary-400 shrink-0" />
                                            <a
                                                href={project.externalUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary-600 hover:underline truncate"
                                            >
                                                {project.externalUrl}
                                            </a>
                                        </div>
                                        {project.addedByAdmin && (
                                            <div className="flex items-center gap-1.5 sm:col-span-2">
                                                <span className="text-secondary-400">{isAr ? "أضافه:" : "Added by:"}</span>
                                                <span className="font-medium text-secondary-700">{project.addedByAdmin.name}</span>
                                            </div>
                                        )}
                                    </dl>
                                    {project.curatorNotes && (
                                        <div className="mt-3 p-3 bg-secondary-50 border border-secondary-200 rounded-lg">
                                            <p className="text-xs text-secondary-500 mb-1">
                                                {isAr ? "ملاحظات المنتقى:" : "Curator notes:"}
                                            </p>
                                            <p className="text-sm text-secondary-700 whitespace-pre-wrap">
                                                {project.curatorNotes}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0">
                                    <Link
                                        href={`/${locale}/admin/projects/curated/${project.id}`}
                                        className="flex items-center gap-1 px-3 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors text-sm"
                                    >
                                        <Pencil className="w-4 h-4" />
                                        {isAr ? "تعديل" : "Edit"}
                                    </Link>
                                    <Link
                                        href={`/${locale}/projects/${project.slug}`}
                                        target="_blank"
                                        className="flex items-center gap-1 px-3 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors text-sm"
                                    >
                                        <SquareArrowOutUpRight className="w-4 h-4" />
                                        {isAr ? "عرض" : "View"}
                                    </Link>
                                    {project.status === "DRAFT" ? (
                                        <button
                                            onClick={() => setPublishTarget({ project, nextStatus: "OPEN" })}
                                            disabled={actionLoading === project.id}
                                            className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm disabled:opacity-50"
                                        >
                                            {actionLoading === project.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <CircleCheckBig className="w-4 h-4" />
                                            )}
                                            {isAr ? "نشر" : "Publish"}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setPublishTarget({ project, nextStatus: "DRAFT" })}
                                            disabled={actionLoading === project.id}
                                            className="flex items-center gap-1 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors text-sm disabled:opacity-50"
                                        >
                                            {actionLoading === project.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <EyeOff className="w-4 h-4" />
                                            )}
                                            {isAr ? "إلغاء النشر" : "Unpublish"}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setDeleteTarget(project)}
                                        disabled={actionLoading === project.id}
                                        className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm disabled:opacity-50"
                                    >
                                        {actionLoading === project.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                        {isAr ? "حذف" : "Delete"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => fetchProjects(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 border border-secondary-200 rounded-lg disabled:opacity-50 hover:bg-secondary-50"
                    >
                        {isAr ? "السابق" : "Previous"}
                    </button>
                    <span className="text-sm text-secondary-600">
                        {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => fetchProjects(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-4 py-2 border border-secondary-200 rounded-lg disabled:opacity-50 hover:bg-secondary-50"
                    >
                        {isAr ? "التالي" : "Next"}
                    </button>
                </div>
            )}

            <ConfirmDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                title={isAr ? "حذف المشروع المنتقى" : "Delete curated project"}
                description={isAr
                    ? "هل أنت متأكد من حذف هذا المشروع المنتقى؟ لا يمكن التراجع عن هذا الإجراء."
                    : "Are you sure you want to delete this curated project? This action cannot be undone."}
                confirmLabel={isAr ? "حذف" : "Delete"}
                cancelLabel={tCommon("cancel")}
                tone="danger"
                onConfirm={handleDeleteConfirm}
            />

            <ConfirmDialog
                open={publishTarget !== null}
                onOpenChange={(open) => { if (!open) setPublishTarget(null); }}
                title={publishTarget?.nextStatus === "OPEN"
                    ? (isAr ? "نشر المشروع" : "Publish project")
                    : (isAr ? "إلغاء النشر" : "Unpublish project")}
                description={publishTarget?.nextStatus === "OPEN"
                    ? (isAr ? "هل تريد نشر هذا المشروع ليظهر للزوار؟" : "Publish this project so it appears to visitors?")
                    : (isAr ? "هل تريد إلغاء نشر هذا المشروع وإخفائه عن الزوار؟" : "Unpublish this project and hide it from visitors?")}
                confirmLabel={publishTarget?.nextStatus === "OPEN"
                    ? (isAr ? "نشر" : "Publish")
                    : (isAr ? "إلغاء النشر" : "Unpublish")}
                cancelLabel={tCommon("cancel")}
                onConfirm={handlePublishConfirm}
            />
        </div>
    );
}

function ProjectStatusBadge({ status, isAr }: { status: string; isAr: boolean }) {
    const config: Record<string, { color: string; label: { ar: string; en: string } }> = {
        DRAFT: { color: "bg-secondary-100 text-secondary-700", label: { ar: "مسودة", en: "Draft" } },
        PENDING: { color: "bg-amber-100 text-amber-700", label: { ar: "قيد المراجعة", en: "Pending" } },
        OPEN: { color: "bg-green-100 text-green-700", label: { ar: "مفتوح", en: "Open" } },
        IN_PROGRESS: { color: "bg-blue-100 text-blue-700", label: { ar: "قيد التنفيذ", en: "In Progress" } },
        COMPLETED: { color: "bg-primary-100 text-primary-700", label: { ar: "مكتمل", en: "Completed" } },
        CANCELLED: { color: "bg-red-100 text-red-700", label: { ar: "ملغى", en: "Cancelled" } },
    };
    const c = config[status] || config.DRAFT;
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c.color}`}>
            {c.label[isAr ? "ar" : "en"]}
        </span>
    );
}

function Globe2Mini() {
    return (
        <span className="inline-block w-3 h-3 rounded-full border-2 border-current" aria-hidden />
    );
}
