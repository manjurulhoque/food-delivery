"use client";

import Link from "next/link";
import { Food } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Stars } from "@/components/stars";

const emojiColors: Record<string, string> = {
    "🍕": "bg-red-50",
    "🍝": "bg-amber-50",
    "🍗": "bg-orange-50",
    "🥩": "bg-red-50",
    "🐟": "bg-blue-50",
};

export function FoodCard({ food }: { food: Food }) {
    return (
        <Link
            href={`/food/${food.id}`}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200 flex flex-col"
        >
            <div className={cn("relative flex items-center justify-center h-36", emojiColors[food.emoji] || "bg-gray-50")}>
                <span className="text-5xl">{food.emoji}</span>
                <button
                    className="absolute bottom-2 right-2 w-7 h-7 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center text-lg font-bold transition-colors"
                    onClick={(e) => { e.preventDefault(); }}
                >
                    +
                </button>
            </div>
            <div className="p-3 flex flex-col flex-1">
                <p className="font-bold text-sm text-gray-900 mb-0.5 truncate">{food.name}</p>
                <p className="text-xs text-gray-400 mb-2 truncate">{food.restaurant}</p>
                <div className="flex items-center gap-1 mb-2">
                    <Stars rating={food.rating} size={11} />
                    <span className="text-xs text-gray-400">({food.reviews})</span>
                </div>
                <p className="text-sm font-extrabold text-green-600 mt-auto">${food.price}.00</p>
            </div>
        </Link>
    );
}
