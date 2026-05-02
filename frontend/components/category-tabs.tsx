"use client";

import { cn } from "@/lib/utils";

export function CategoryTabs({
    active,
    onSelect,
    categories = [],
}: {
    active: string;
    onSelect: (cat: string) => void;
    categories?: string[];
}) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
            {categories.map((c) => (
                <button
                    key={c}
                    onClick={() => onSelect(c)}
                    className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap border transition-all",
                        active === c
                            ? "bg-orange-500 border-orange-500 text-white"
                            : "bg-white border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500"
                    )}
                >
                    {c}
                </button>
            ))}
        </div>
    );
}
