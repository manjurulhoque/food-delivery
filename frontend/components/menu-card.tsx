"use client";

import Link from "next/link";
import { Menu } from "@/lib/types/menu";
import { cn } from "@/lib/utils";
import { Stars } from "@/components/stars";
import { FoodyMenuPlaceholder } from "@/components/foody-menu-placeholder";
import { resolveMenuImageUrl } from "@/lib/menu-image";
import { addMenuToBag } from "@/lib/bag";

const emojiColors: Record<string, string> = {
    "🍕": "bg-red-50",
    "🍝": "bg-amber-50",
    "🍗": "bg-orange-50",
    "🥩": "bg-red-50",
    "🐟": "bg-blue-50",
};

export function MenuCard({ menu }: { menu: Menu }) {
    const showPhoto = Boolean(menu.image_path);
    const showPlaceholder = menu.image_path === null || menu.image_path === "";

    return (
        <Link
            href={`/menu/${menu.id}`}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200 flex flex-col"
        >
            <div
                className={cn(
                    "relative flex items-center justify-center h-36 overflow-hidden",
                    (showPhoto || showPlaceholder) && "bg-[#E8F7EF]"
                )}
            >
                {showPhoto && menu.image_path ? (
                    // eslint-disable-next-line @next/next/no-img-element -- remote / API URLs
                    <img
                        src={resolveMenuImageUrl(menu.image_path) ?? ""}
                        alt={menu.name}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : showPlaceholder ? (
                    <FoodyMenuPlaceholder size={96} label={menu.name} className="relative z-0" />
                ) : (
                    <></>
                )}
                <button
                    className="absolute bottom-2 right-2 w-7 h-7 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center text-lg font-bold transition-colors"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addMenuToBag(menu, 1);
                    }}
                >
                    +
                </button>
            </div>
            <div className="p-3 flex flex-col flex-1">
                <p className="font-bold text-sm text-gray-900 mb-0.5 truncate">{menu.name}</p>
                <p className="text-xs text-gray-400 mb-2 truncate">{menu.restaurant?.name ?? ""}</p>
                <div className="flex items-center gap-1 mb-2">
                    <Stars rating={menu.rating} size={11} />
                    <span className="text-xs text-gray-400">({menu.reviews})</span>
                </div>
                <p className="text-sm font-extrabold text-green-600 mt-auto">${menu.price}.00</p>
            </div>
        </Link>
    );
}
