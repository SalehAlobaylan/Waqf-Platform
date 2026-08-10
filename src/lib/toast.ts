import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
    id: number;
    type: ToastType;
    message: string;
    title?: string;
}

interface ToastState {
    toasts: Toast[];
    push: (type: ToastType, message: string, title?: string) => void;
    dismiss: (id: number) => void;
}

const TOAST_DURATION_MS = 5000;

let nextToastId = 1;

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],
    push: (type, message, title) => {
        const id = nextToastId++;
        set((state) => ({ toasts: [...state.toasts, { id, type, message, title }] }));
        setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, TOAST_DURATION_MS);
    },
    dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/**
 * Minimal toast helpers — safe to call from any client event handler.
 * Messages should already be localized by the caller.
 */
export const toast = {
    success: (message: string, title?: string) => useToastStore.getState().push("success", message, title),
    error: (message: string, title?: string) => useToastStore.getState().push("error", message, title),
    info: (message: string, title?: string) => useToastStore.getState().push("info", message, title),
    warning: (message: string, title?: string) => useToastStore.getState().push("warning", message, title),
};
