"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function Toaster() {
    const { toasts, dismissToast } = useToast();

    return (
        <div className="fixed top-4 right-4 z-[100] w-[min(92vw,360px)] space-y-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={cn(
                        "rounded-xl border bg-white shadow-lg p-3",
                        toast.variant === "destructive"
                            ? "border-red-200 bg-red-50"
                            : "border-gray-200"
                    )}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p
                                className={cn(
                                    "text-sm font-bold",
                                    toast.variant === "destructive"
                                        ? "text-red-700"
                                        : "text-gray-900"
                                )}
                            >
                                {toast.title}
                            </p>
                            {toast.description && (
                                <p
                                    className={cn(
                                        "text-xs mt-0.5",
                                        toast.variant === "destructive"
                                            ? "text-red-600"
                                            : "text-gray-500"
                                    )}
                                >
                                    {toast.description}
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => dismissToast(toast.id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Dismiss notification"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
