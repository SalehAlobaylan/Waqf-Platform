"use client";

import { create } from "zustand";

export interface CampaignRoleDraft {
    tempId: string;
    skillId: number | null;
    skillName: string;
    title: string;
    description: string;
    count: number;
    seniority: "JUNIOR" | "MID" | "SENIOR" | "ANY";
    isRequired: boolean;
    persistedId?: string;
}

export interface CampaignMilestoneDraft {
    tempId: string;
    title: string;
    description: string;
    persistedId?: string;
}

export interface CampaignDraft {
    id?: string;
    title: string;
    pitch: string;
    problem: string;
    outcome: string;
    category: string;
    language: "ARABIC" | "ENGLISH" | "BOTH";
    country: string;
    contactEmail: string;
    organizationId: string;
    recruitmentDeadline: string;
    startsAt: string;
    roles: CampaignRoleDraft[];
    milestones: CampaignMilestoneDraft[];
}

const initial: CampaignDraft = {
    title: "",
    pitch: "",
    problem: "",
    outcome: "",
    category: "",
    language: "BOTH",
    country: "",
    contactEmail: "",
    organizationId: "",
    recruitmentDeadline: "",
    startsAt: "",
    roles: [],
    milestones: [],
};

interface CampaignDraftStore {
    draft: CampaignDraft;
    step: number;
    setStep: (step: number) => void;
    update: (partial: Partial<CampaignDraft>) => void;
    setRole: (tempId: string, partial: Partial<CampaignRoleDraft>) => void;
    addRole: (role?: Partial<CampaignRoleDraft>) => void;
    removeRole: (tempId: string) => void;
    setMilestone: (tempId: string, partial: Partial<CampaignMilestoneDraft>) => void;
    addMilestone: (m?: Partial<CampaignMilestoneDraft>) => void;
    removeMilestone: (tempId: string) => void;
    hydrate: (data: CampaignDraft) => void;
    reset: () => void;
}

let tempCounter = 1;
const nextTempId = () => `t${Date.now()}-${tempCounter++}`;

export const useCampaignDraft = create<CampaignDraftStore>((set) => ({
    draft: initial,
    step: 0,
    setStep: (step) => set({ step }),
    update: (partial) => set((s) => ({ draft: { ...s.draft, ...partial } })),
    setRole: (tempId, partial) =>
        set((s) => ({
            draft: {
                ...s.draft,
                roles: s.draft.roles.map((r) =>
                    r.tempId === tempId ? { ...r, ...partial } : r
                ),
            },
        })),
    addRole: (role) =>
        set((s) => ({
            draft: {
                ...s.draft,
                roles: [
                    ...s.draft.roles,
                    {
                        tempId: nextTempId(),
                        skillId: null,
                        skillName: "",
                        title: "",
                        description: "",
                        count: 1,
                        seniority: "ANY",
                        isRequired: true,
                        ...role,
                    },
                ],
            },
        })),
    removeRole: (tempId) =>
        set((s) => ({
            draft: {
                ...s.draft,
                roles: s.draft.roles.filter((r) => r.tempId !== tempId),
            },
        })),
    setMilestone: (tempId, partial) =>
        set((s) => ({
            draft: {
                ...s.draft,
                milestones: s.draft.milestones.map((m) =>
                    m.tempId === tempId ? { ...m, ...partial } : m
                ),
            },
        })),
    addMilestone: (m) =>
        set((s) => ({
            draft: {
                ...s.draft,
                milestones: [
                    ...s.draft.milestones,
                    { tempId: nextTempId(), title: "", description: "", ...m },
                ],
            },
        })),
    removeMilestone: (tempId) =>
        set((s) => ({
            draft: {
                ...s.draft,
                milestones: s.draft.milestones.filter((m) => m.tempId !== tempId),
            },
        })),
    hydrate: (data) => set({ draft: data, step: 0 }),
    reset: () => set({ draft: initial, step: 0 }),
}));
