"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
    Search,
    Filter,
    Shield,
    User,
    Trash2,
    MoreVertical,
    CircleAlert,
    Loader2,
    FolderKanban,
    FileCheck
} from "lucide-react";

interface UserData {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: "USER" | "ADMIN";
    createdAt: string;
    _count: {
        projects: number;
        applications: number;
    };
}

interface UserManagementProps {
    locale: string;
}

export function UserManagement({ locale }: UserManagementProps) {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [pagination, setPagination] = useState({
        page: 1,
        total: 0,
        totalPages: 0,
    });
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const t = useTranslations("admin");
    const tCommon = useTranslations("common");
    const isAr = locale === "ar";

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                ...(searchQuery && { search: searchQuery }),
                ...(roleFilter && roleFilter !== "all" && { role: roleFilter }),
            });

            const response = await fetch(`/api/admin/users?${params}`);
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
                setPagination(prev => ({
                    ...prev,
                    total: data.pagination.total,
                    totalPages: data.pagination.totalPages,
                }));
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, roleFilter, pagination.page]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPagination(prev => ({ ...prev, page: 1 }));
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleRoleChange = async (userId: string, newRole: "USER" | "ADMIN") => {
        try {
            setActionLoading(userId);
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });

            if (response.ok) {
                fetchUsers();
            } else {
                const error = await response.json();
                alert(error.error);
            }
        } catch (error) {
            console.error("Failed to update role:", error);
        } finally {
            setActionLoading(null);
            setOpenMenu(null);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm(isAr ? "هل أنت متأكد من حذف هذا المستخدم؟" : "Are you sure you want to delete this user?")) {
            return;
        }

        try {
            setActionLoading(userId);
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                fetchUsers();
            } else {
                const error = await response.json();
                alert(error.error);
            }
        } catch (error) {
            console.error("Failed to delete user:", error);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-secondary-900">
                    {t("users")}
                </h1>
                <p className="text-secondary-500 mt-1">
                    {isAr ? "إدارة جميع المستخدمين وأدوارهم" : "Manage all users and their roles"}
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
                            placeholder={isAr ? "بحث بالاسم أو البريد..." : "Search by name or email..."}
                            className="w-full pl-10 pr-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    {/* Role Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-secondary-400" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="all">{isAr ? "جميع الأدوار" : "All Roles"}</option>
                            <option value="USER">{isAr ? "مستخدم" : "User"}</option>
                            <option value="ADMIN">{isAr ? "مدير" : "Admin"}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
                <div className="bg-white rounded-xl border border-secondary-200 px-4 py-3">
                    <span className="text-sm text-secondary-500">{isAr ? "الإجمالي:" : "Total:"}</span>
                    <span className="ml-2 font-semibold text-secondary-900">{pagination.total}</span>
                </div>
            </div>

            {/* Users Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                </div>
            ) : users.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-secondary-200">
                    <CircleAlert className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                    <p className="text-secondary-600">
                        {t("noUsers")}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-secondary-50">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">
                                    {isAr ? "المستخدم" : "User"}
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">
                                    {isAr ? "الدور" : "Role"}
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">
                                    {isAr ? "النشاط" : "Activity"}
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">
                                    {isAr ? "تاريخ الانضمام" : "Joined"}
                                </th>
                                <th className="text-right px-6 py-4 text-sm font-medium text-secondary-600">
                                    {isAr ? "إجراءات" : "Actions"}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-secondary-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700">
                                                {user.name?.charAt(0) || "?"}
                                            </div>
                                            <div>
                                                <p className="font-medium text-secondary-900">{user.name}</p>
                                                <p className="text-sm text-secondary-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${user.role === "ADMIN"
                                            ? "bg-primary-100 text-primary-700"
                                            : "bg-secondary-100 text-secondary-700"
                                            }`}>
                                            {user.role === "ADMIN" ? (
                                                <Shield className="w-3 h-3" />
                                            ) : (
                                                <User className="w-3 h-3" />
                                            )}
                                            {user.role === "ADMIN" ? (isAr ? "مدير" : "Admin") : (isAr ? "مستخدم" : "User")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4 text-sm text-secondary-600">
                                            <span className="flex items-center gap-1">
                                                <FolderKanban className="w-4 h-4" />
                                                {user._count.projects}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FileCheck className="w-4 h-4" />
                                                {user._count.applications}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-secondary-600">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="relative inline-block">
                                            <button
                                                onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                                                disabled={actionLoading === user.id}
                                                aria-label={isAr ? "خيارات المستخدم" : "User options"}
                                                className="p-2 hover:bg-secondary-100 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {actionLoading === user.id ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <MoreVertical className="w-5 h-5 text-secondary-600" />
                                                )}
                                            </button>

                            {openMenu === user.id && (
                                <div className="absolute end-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-secondary-200 py-1 z-10">
                                    {user.role === "USER" ? (
                                        <button
                                            onClick={() => handleRoleChange(user.id, "ADMIN")}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                                        >
                                            <Shield className="w-4 h-4" />
                                            {t("makeAdmin")}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleRoleChange(user.id, "USER")}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                                        >
                                            <User className="w-4 h-4" />
                                            {t("removeAdmin")}
                                        </button>
                                    )}
                                    <hr className="my-1 border-secondary-200" />
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {t("delete")}
                                    </button>
                                </div>
                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
        </div>
    );
}
