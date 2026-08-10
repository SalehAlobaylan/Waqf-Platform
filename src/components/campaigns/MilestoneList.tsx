"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, Loader2, Circle, ListChecks } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { toast } from "@/lib/toast";
import { translateApiError } from "@/lib/i18n/client-errors";

export interface MilestoneItem {
    id: string;
    title: string;
    description: string | null;
    isDone: boolean;
}

interface Props {
    campaignId: string;
    initialMilestones: MilestoneItem[];
    canEdit: boolean;
}

export function MilestoneList({ campaignId, initialMilestones, canEdit }: Props) {
    const t = useTranslations("campaigns");
    const tGlobal = useTranslations();
    const router = useRouter();
    const [items, setItems] = useState(initialMilestones);
    const [newTitle, setNewTitle] = useState("");
    const [adding, setAdding] = useState(false);
    const [saving, setSaving] = useState<string | null>(null);

    const toggle = async (id: string) => {
        if (!canEdit) return;
        setSaving(id);
        const target = items.find((m) => m.id === id);
        if (!target) return;
        const next = !target.isDone;
        setItems((prev) => prev.map((m) => (m.id === id ? { ...m, isDone: next } : m)));
        try {
            await apiFetch(`/api/campaigns/${campaignId}/milestones/${id}`, {
                method: "PUT",
                body: { isDone: next },
            });
            router.refresh();
        } catch (error) {
            setItems((prev) => prev.map((m) => (m.id === id ? { ...m, isDone: !next } : m)));
            toast.error(translateApiError(tGlobal, error));
        } finally {
            setSaving(null);
        }
    };

    const addOne = async () => {
        if (!newTitle.trim()) return;
        setAdding(true);
        try {
            const created = await apiFetch<MilestoneItem>(`/api/campaigns/${campaignId}/milestones`, {
                method: "POST",
                body: { title: newTitle.trim() },
            });
            setItems((prev) => [...prev, created]);
            setNewTitle("");
            router.refresh();
        } catch (error) {
            toast.error(translateApiError(tGlobal, error));
        } finally {
            setAdding(false);
        }
    };

    const remove = async (id: string) => {
        if (!canEdit) return;
        setSaving(id);
        try {
            await apiFetch(`/api/campaigns/${campaignId}/milestones/${id}`, { method: "DELETE" });
            setItems((prev) => prev.filter((m) => m.id !== id));
            router.refresh();
        } catch (error) {
            toast.error(translateApiError(tGlobal, error));
        } finally {
            setSaving(null);
        }
    };

    return (
        <div>
            <h2 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-primary-600" />
                {t("detail.milestonesHeading")}
            </h2>
            {items.length === 0 ? (
                <p className="text-sm text-secondary-500 italic">
                    {t("detail.noMilestones")}
                </p>
            ) : (
                <ul className="space-y-2">
                    {items.map((m) => (
                        <li
                            key={m.id}
                            className="flex items-center gap-3 p-3 rounded-xl border border-waqf-border bg-white"
                        >
                            <button
                                onClick={() => toggle(m.id)}
                                disabled={!canEdit || saving === m.id}
                                aria-label="Toggle milestone"
                                className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    m.isDone
                                        ? "bg-primary-600 border-primary-600 text-white"
                                        : "border-secondary-300 hover:border-primary-400"
                                } ${!canEdit ? "cursor-default" : "cursor-pointer"}`}
                            >
                                {m.isDone ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5 opacity-0" />}
                            </button>
                            <div className="flex-1 min-w-0">
                                <p
                                    className={`text-sm font-medium ${
                                        m.isDone ? "line-through text-secondary-400" : "text-secondary-800"
                                    }`}
                                >
                                    {m.title}
                                </p>
                                {m.description && (
                                    <p className="text-xs text-secondary-500 mt-0.5">{m.description}</p>
                                )}
                            </div>
                            {canEdit && (
                                <button
                                    onClick={() => remove(m.id)}
                                    disabled={saving === m.id}
                                    className="text-xs text-red-500 hover:underline shrink-0"
                                >
                                    ×
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            {canEdit && (
                <div className="mt-3 flex items-center gap-2">
                    <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") addOne();
                        }}
                        placeholder={t("wizard.step4.milestoneTitlePlaceholder")}
                        className="flex-1 rounded-xl border border-waqf-border bg-white px-3 py-2 text-sm"
                    />
                    <button
                        onClick={addOne}
                        disabled={adding || !newTitle.trim()}
                        className="rounded-xl h-10 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-xs font-bold inline-flex items-center gap-1"
                    >
                        {adding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {t("wizard.step4.addMilestone")}
                    </button>
                </div>
            )}
        </div>
    );
}
