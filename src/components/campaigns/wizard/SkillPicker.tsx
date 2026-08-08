"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Search, X, Check } from "lucide-react";

export interface SkillOption {
    id: number;
    name: string;
    nameAr: string | null;
    category: string;
}

interface Props {
    value: number | null;
    initialName?: string;
    onChange: (skill: SkillOption | null) => void;
    placeholder?: string;
    required?: boolean;
}

export function SkillPicker({ value, initialName, onChange, placeholder, required }: Props) {
    const t = useTranslations("campaigns.wizard.step3");
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [options, setOptions] = useState<SkillOption[]>([]);
    const [pending, startTransition] = useTransition();
    const [picked, setPicked] = useState<SkillOption | null>(
        value ? { id: value, name: initialName ?? "", nameAr: null, category: "" } : null
    );
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        startTransition(() => {
            fetch(`/api/skills?${params.toString()}`)
                .then((r) => r.json())
                .then((data) => {
                    if (!cancelled) {
                        startTransition(() => {
                            setOptions(data.skills ?? []);
                        });
                    }
                })
                .catch(() => {});
        });
        return () => {
            cancelled = true;
        };
    }, [query, open, startTransition]);

    const pick = (s: SkillOption) => {
        setPicked(s);
        onChange(s);
        setOpen(false);
        setQuery("");
    };

    const clear = () => {
        setPicked(null);
        onChange(null);
        setQuery("");
    };

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-xs font-semibold text-secondary-600 mb-1">
                {t("skill")}
                {required && <span className="text-red-500"> *</span>}
            </label>
            {picked && !open ? (
                <div className="flex items-center justify-between rounded-xl border border-waqf-border bg-white px-3 py-2 text-sm">
                    <span className="font-medium">{picked.name}</span>
                    <button
                        type="button"
                        onClick={clear}
                        className="text-secondary-400 hover:text-red-500"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setOpen(true);
                        }}
                        onFocus={() => setOpen(true)}
                        placeholder={placeholder ?? t("skillPlaceholder")}
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-waqf-border bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                    />
                </div>
            )}
            {open && (
                <div className="absolute z-30 mt-1 w-full max-h-56 overflow-y-auto rounded-xl border border-waqf-border bg-white shadow-lg">
                    {pending && options.length === 0 ? (
                        <p className="p-3 text-sm text-secondary-500">Loading…</p>
                    ) : options.length === 0 ? (
                        <p className="p-3 text-sm text-secondary-500">No skills</p>
                    ) : (
                        <ul>
                            {options.map((s) => (
                                <li key={s.id}>
                                    <button
                                        type="button"
                                        onClick={() => pick(s)}
                                        className="w-full text-left px-3 py-2 hover:bg-primary-50 flex items-center justify-between text-sm"
                                    >
                                        <span>
                                            <span className="font-medium">{s.name}</span>
                                            {s.nameAr && (
                                                <span className="text-secondary-400 text-xs ml-2">
                                                    {s.nameAr}
                                                </span>
                                            )}
                                        </span>
                                        {picked?.id === s.id && (
                                            <Check className="w-4 h-4 text-primary-600" />
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
