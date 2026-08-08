"use client";

import { useTranslations } from "next-intl";
import { Trash2, GripVertical } from "lucide-react";
import { useCampaignDraft, type CampaignRoleDraft } from "@/components/campaigns/wizard/useCampaignDraft";
import { SkillPicker } from "@/components/campaigns/wizard/SkillPicker";

export function RoleBuilder() {
    const t = useTranslations("campaigns.wizard.step3");
    const draft = useCampaignDraft((s) => s.draft);
    const setRole = useCampaignDraft((s) => s.setRole);
    const addRole = useCampaignDraft((s) => s.addRole);
    const removeRole = useCampaignDraft((s) => s.removeRole);

    return (
        <div className="space-y-4">
            {draft.roles.length === 0 && (
                <p className="text-sm text-secondary-500 italic">{t("noRoles")}</p>
            )}
            {draft.roles.map((r, idx) => (
                <RoleCard
                    key={r.tempId}
                    role={r}
                    index={idx}
                    onChange={(p) => setRole(r.tempId, p)}
                    onRemove={() => removeRole(r.tempId)}
                />
            ))}
            <button
                type="button"
                onClick={() => addRole()}
                className="rounded-xl h-10 px-4 border border-dashed border-waqf-border bg-white hover:bg-primary-50 text-sm font-semibold text-primary-700"
            >
                {t("addRole")}
            </button>
        </div>
    );
}

function RoleCard({
    role,
    index,
    onChange,
    onRemove,
}: {
    role: CampaignRoleDraft;
    index: number;
    onChange: (p: Partial<CampaignRoleDraft>) => void;
    onRemove: () => void;
}) {
    const t = useTranslations("campaigns.wizard.step3");
    return (
        <div className="rounded-2xl border border-waqf-border bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-secondary-500">
                    <GripVertical className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                        Role {index + 1}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={onRemove}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                    aria-label="Remove"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <SkillPicker
                    value={role.skillId}
                    initialName={role.skillName}
                    onChange={(s) =>
                        onChange({ skillId: s?.id ?? null, skillName: s?.name ?? "" })
                    }
                    required
                />
                <div>
                    <label className="block text-xs font-semibold text-secondary-600 mb-1">
                        {t("title")}
                    </label>
                    <input
                        type="text"
                        value={role.title}
                        onChange={(e) => onChange({ title: e.target.value })}
                        placeholder={t("titlePlaceholder")}
                        className="w-full rounded-xl border border-waqf-border bg-white px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-secondary-600 mb-1">
                    {t("description")}
                </label>
                <textarea
                    rows={2}
                    value={role.description}
                    onChange={(e) => onChange({ description: e.target.value })}
                    placeholder={t("descriptionPlaceholder")}
                    className="w-full rounded-xl border border-waqf-border bg-white px-3 py-2 text-sm resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                />
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-secondary-600 mb-1">
                        {t("count")}
                    </label>
                    <input
                        type="number"
                        min={1}
                        max={50}
                        value={role.count}
                        onChange={(e) => onChange({ count: Math.max(1, Number(e.target.value) || 1) })}
                        className="w-full rounded-xl border border-waqf-border bg-white px-3 py-2 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-secondary-600 mb-1">
                        {t("seniority")}
                    </label>
                    <select
                        value={role.seniority}
                        onChange={(e) =>
                            onChange({ seniority: e.target.value as CampaignRoleDraft["seniority"] })
                        }
                        className="w-full rounded-xl border border-waqf-border bg-white px-3 py-2 text-sm"
                    >
                        {(["JUNIOR", "MID", "SENIOR", "ANY"] as const).map((v) => (
                            <option key={v} value={v}>
                                {t(`seniorityOptions.${v}`)}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col">
                    <label className="block text-xs font-semibold text-secondary-600 mb-1">
                        {t("required")}
                    </label>
                    <label className="flex items-center gap-2 h-[38px]">
                        <input
                            type="checkbox"
                            checked={role.isRequired}
                            onChange={(e) => onChange({ isRequired: e.target.checked })}
                            className="w-4 h-4 accent-primary-600"
                        />
                        <span className="text-sm text-secondary-700">{t("required")}</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
