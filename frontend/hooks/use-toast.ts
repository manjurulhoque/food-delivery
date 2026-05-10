"use client";

import { useEffect, useState } from "react";

export type ToastInput = {
    title: string;
    description?: string;
    variant?: "default" | "destructive";
    durationMs?: number;
};

export type ToastMessage = ToastInput & {
    id: string;
};

let memoryToasts: ToastMessage[] = [];
const listeners = new Set<(toasts: ToastMessage[]) => void>();

function notify() {
    for (const listener of listeners) {
        listener(memoryToasts);
    }
}

export function dismissToast(id: string) {
    memoryToasts = memoryToasts.filter((toast) => toast.id !== id);
    notify();
}

export function toast(input: ToastInput) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const message: ToastMessage = {
        id,
        durationMs: 3000,
        variant: "default",
        ...input,
    };
    memoryToasts = [message, ...memoryToasts].slice(0, 5);
    notify();
    const timeout = window.setTimeout(() => dismissToast(id), message.durationMs);
    return {
        id,
        dismiss: () => {
            window.clearTimeout(timeout);
            dismissToast(id);
        },
    };
}

export function useToast() {
    const [toasts, setToasts] = useState<ToastMessage[]>(memoryToasts);

    useEffect(() => {
        listeners.add(setToasts);
        return () => {
            listeners.delete(setToasts);
        };
    }, []);

    return {
        toasts,
        toast,
        dismissToast,
    };
}
