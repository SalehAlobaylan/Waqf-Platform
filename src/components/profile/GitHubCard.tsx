"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { GitBranch, Loader2, RefreshCw, Save } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { translateApiError, firstValidationMessage } from "@/lib/i18n/client-errors";
import type { GithubPublicProfile } from "@/lib/github";

interface GitHubCardProps {
    initialUsername: string | null;
    initialData: GithubPublicProfile | null;
}

/**
 * Lets a contributor connect/refresh their GitHub account. The fetched public
 * profile is cached server-side, so the Refresh button sends `force: true` to
 * bypass that cache without leaving the app's rate limits.
 */
export function GitHubCard({ initialUsername, initialData }: GitHubCardProps) {
    const t = useTranslations("profile.github");
    const tGlobal = useTranslations();
    const [username, setUsername] = useState(initialUsername ?? "");
    const [data, setData] = useState<GithubPublicProfile | null>(initialData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const sync = async (force: boolean) => {
        const target = username.trim();
        if (!target) {
            setError(t("usernameRequired"));
            return;
        }
        setLoading(true);
        setError("");
        try {
            const result = await apiFetch<{ username: string; data: GithubPublicProfile }>(
                "/api/contributors/github",
                { method: "PATCH", body: { username: target, force } }
            );
            setUsername(result.username);
            setData(result.data);
        } catch (err) {
            setError(firstValidationMessage(err) ?? translateApiError(tGlobal, err));
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "flex-1 px-4 py-2 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 focus:bg-white";

    const actionButtonClass =
        "flex items-center gap-2 px-4 py-2 border border-secondary-200 text-secondary-700 text-sm font-medium rounded-xl hover:bg-secondary-50 transition disabled:opacity-60";

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <GitBranch size={18} className="text-secondary-700" />
                <h3 className="font-medium text-secondary-900">{t("title")}</h3>
            </div>
            <p className="text-xs text-secondary-500">{t("description")}</p>

            {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
                    {error}
                </div>
            )}

            {data && (
                <div className="flex items-center gap-4 p-4 rounded-xl border border-secondary-200 bg-secondary-50/50">
                    {data.avatarUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={data.avatarUrl} alt={`@${data.username}`} className="w-14 h-14 rounded-full" />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-secondary-900 truncate">
                            {data.name || `@${data.username}`}
                        </p>
                        <a
                            href={`https://github.com/${data.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-600 hover:underline"
                        >
                            @{data.username}
                        </a>
                        {data.bio && <p className="text-xs text-secondary-500 mt-1 line-clamp-2">{data.bio}</p>}
                        <p className="text-xs text-secondary-400 mt-2">
                            {t("followers")}: {data.followers} · {t("publicRepos")}: {data.publicRepos}
                        </p>
                    </div>
                </div>
            )}

            <div className="flex gap-2">
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={inputClass}
                    placeholder={t("placeholder")}
                />
                {data ? (
                    <>
                        <button
                            type="button"
                            onClick={() => sync(false)}
                            disabled={loading}
                            className={`${actionButtonClass} bg-primary-600 text-white border-primary-600 hover:bg-primary-700`}
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {t("update")}
                        </button>
                        <button
                            type="button"
                            onClick={() => sync(true)}
                            disabled={loading}
                            className={actionButtonClass}
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                            {t("refresh")}
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={() => sync(false)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition disabled:opacity-60"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {t("connect")}
                    </button>
                )}
            </div>
        </div>
    );
}