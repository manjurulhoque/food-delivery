"use client";

import { useMemo, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Clock,
    MapPin,
    ChefHat,
    Package,
    ThumbsUp,
    MessageCircle,
    Phone,
    Store,
} from "lucide-react";
import { Menu } from "@/lib/types/menu";
import { MenuCard } from "@/components/menu-card";
import { Stars } from "@/components/stars";
import { cn } from "@/lib/utils";
import {
    useGetMenuByIdQuery,
    useGetAvailableMenusQuery,
} from "@/lib/services/restaurant-api";
import { FoodyMenuPlaceholder } from "@/components/foody-menu-placeholder";
import { resolveMenuImageUrl } from "@/lib/menu-image";
import { addMenuToBag } from "@/lib/bag";

const REVIEWS = [
    {
        name: "Farnoosh Bagheri",
        rating: 4.5,
        text: "It was one of the most scrumptious cuisines that I've ever eaten. It was completely hot, fresh, affordable. Make sure to try it!",
        likes: 1,
        comments: 1,
    },
    {
        name: "Farnoosh Bagheri",
        rating: 4.5,
        text: "It was one of the most scrumptious cuisines that I've ever eaten. It was completely hot, fresh, affordable. Make sure to try it!",
        likes: 3,
        comments: 2,
    },
    {
        name: "Farnoosh Bagheri",
        rating: 4.5,
        text: "It was one of the most scrumptious cuisines that I've ever eaten. It was completely hot, fresh, affordable. Make sure to try it!",
        likes: 5,
        comments: 1,
    },
    {
        name: "Farnoosh Bagheri",
        rating: 4.5,
        text: "It was one of the most scrumptious cuisines that I've ever eaten. It was completely hot, fresh, affordable. Make sure to try it!",
        likes: 2,
        comments: 3,
    },
];

const MENU_EMOJIS = ["🍕", "🍝", "🍗", "🥩", "🐟"];


export default function FoodDetailPage() {
    const params = useParams();
    const idParam = params?.id;
    const menuId = typeof idParam === "string" ? parseInt(idParam, 10) : NaN;
    const isValidId = Number.isFinite(menuId) && menuId > 0;

    const {
        data: menuResponse,
        isLoading: isMenuLoading,
        isError: isMenuError,
    } = useGetMenuByIdQuery(menuId, { skip: !isValidId });

    const { data: menusListResponse } = useGetAvailableMenusQuery({ page_size: 100 });

    const [qty, setQty] = useState(1);
    const [tab, setTab] = useState<"Description" | "Reviews">("Description");

    const menu = menuResponse?.data ?? null;

    const relatedMenus = useMemo(() => {
        if (!menu) return [];
        const all = menusListResponse?.data ?? [];
        const others = all.filter((m) => m.id !== menu.id);
        const sameCategory = others.filter(
            (m) =>
                m.category?.id != null &&
                menu.category?.id != null &&
                m.category.id === menu.category.id
        );
        const picked =
            sameCategory.length > 0
                ? sameCategory
                : others.filter((m) => m.restaurant?.id === menu.restaurant?.id);
        return picked.slice(0, 4);
    }, [menu, menusListResponse]);

    const imageUrl = menu ? resolveMenuImageUrl(menu.image_path) : null;

    const descriptionText = menu
        ? `Fresh ${menu.name}${
              menu.category?.name ? ` — ${menu.category.name}` : ""
          }. Served from ${menu.restaurant?.name ?? ""}. Order through Foody for reliable delivery.`
        : "";

    if (!isValidId) {
        notFound();
    }

    if (isMenuLoading) {
        return (
            <main className="max-w-6xl mx-auto px-5 py-6">
                <div className="h-10 w-40 bg-gray-100 rounded-lg mb-6 animate-pulse" />
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
                    <div className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
                </div>
            </main>
        );
    }

    if (isMenuError || !menu) {
        notFound();
    }

    return (
        <main className="max-w-6xl mx-auto px-5 py-6">
            <Link
                href="/menu"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 mb-6 transition-colors"
            >
                <ArrowLeft size={14} />
                Back to Menu
            </Link>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center gap-4">
                    <div className="w-full h-56 flex items-center justify-center overflow-hidden rounded-xl bg-gray-50">
                        {imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={imageUrl}
                                alt={menu.name}
                                className="max-h-full max-w-full object-contain"
                            />
                        ) : (
                            <FoodyMenuPlaceholder
                                size={160}
                                label={menu.name}
                                className="opacity-95"
                            />
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-start justify-between mb-2">
                        <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                            Available
                        </span>
                        {menu.category?.name && (
                            <span className="text-xs font-semibold text-gray-500">
                                {menu.category.name}
                            </span>
                        )}
                    </div>
                    <h1 className="font-[Poppins] font-bold text-2xl text-gray-900 mb-4">
                        {menu.name}
                    </h1>

                    <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 mb-5">
                        <div className="flex items-center gap-2">
                            <Clock size={15} className="text-green-600 shrink-0" />
                            <span className="text-sm text-gray-500">20–35 min delivery time</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Stars rating={4.5} size={13} />
                            <span className="text-sm font-bold text-gray-800">4.5</span>
                            <span className="text-xs text-gray-400">(community rating)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Package size={15} className="text-green-600 shrink-0" />
                            <span className="text-sm text-gray-500">On Offer</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ChefHat size={15} className="text-green-600 shrink-0" />
                            <span className="text-sm font-semibold text-gray-800">
                                {menu.restaurant?.name ?? ""}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={15} className="text-green-600 shrink-0" />
                            <span className="text-sm text-gray-500">{menu.restaurant?.address ?? ""}</span>
                        </div>
                    </div>

                    <div className="mb-5 rounded-xl border border-green-100 bg-green-50/50 p-4">
                        <p className="text-xs font-bold text-green-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                            <Store size={14} />
                            Restaurant
                        </p>
                        <p className="font-semibold text-gray-900">{menu.restaurant?.name ?? ""}</p>
                        <div className="mt-2 space-y-1.5 text-sm text-gray-600">
                            <div className="flex items-start gap-2">
                                <MapPin size={14} className="text-green-600 shrink-0 mt-0.5" />
                                <span>{menu.restaurant?.address ?? ""}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="text-green-600 shrink-0" />
                                <a
                                    href={`tel:${menu.restaurant?.phone ?? ""}`}
                                    className="text-green-700 font-medium hover:underline"
                                >
                                    {menu.restaurant?.phone ?? ""}
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="mb-5">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                            Highlights
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {(menu.category?.name ? [menu.category.name] : ["Chef's pick"]).map(
                                (tag) => (
                                    <span
                                        key={tag}
                                        className="bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full"
                                    >
                                        {tag}
                                    </span>
                                )
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-2xl font-extrabold text-orange-500">
                            ${Number(menu.price).toFixed(2)}
                        </span>
                        <div className="flex items-center gap-2 bg-green-50 rounded-lg px-2 py-1">
                            <button
                                type="button"
                                onClick={() => setQty((q) => Math.max(1, q - 1))}
                                className="w-6 h-6 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-bold flex items-center justify-center transition-colors"
                            >
                                −
                            </button>
                            <span className="text-sm font-extrabold w-5 text-center text-gray-800">
                                {qty}
                            </span>
                            <button
                                type="button"
                                onClick={() => setQty((q) => q + 1)}
                                className="w-6 h-6 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-bold flex items-center justify-center transition-colors"
                            >
                                +
                            </button>
                        </div>
                        <button
                            type="button"
                            className="flex-1 min-w-[140px] bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
                            onClick={() => addMenuToBag(menu, qty)}
                            disabled={qty <= 0}
                        >
                            Add to Bag
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
                <div className="flex border-b border-gray-100 mb-5">
                    {(["Description", "Reviews"] as const).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTab(t)}
                            className={cn(
                                "px-5 pb-3 text-sm font-bold border-b-2 transition-all",
                                tab === t
                                    ? "text-green-600 border-green-600"
                                    : "text-gray-400 border-transparent hover:text-gray-700"
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {tab === "Description" ? (
                    <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
                        {descriptionText}
                    </p>
                ) : (
                    <>
                        <div className="grid md:grid-cols-2 gap-4 mb-5">
                            {REVIEWS.map((review, i) => (
                                <div key={i} className="bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">
                                                FB
                                            </div>
                                            <span className="text-sm font-bold text-gray-800">
                                                {review.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Stars rating={review.rating} size={11} />
                                            <span className="text-xs font-bold text-amber-500">
                                                {review.rating}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed mb-3">
                                        {review.text}
                                    </p>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-600 transition-colors"
                                        >
                                            <ThumbsUp size={11} /> {review.likes}
                                        </button>
                                        <button
                                            type="button"
                                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-600 transition-colors"
                                        >
                                            <MessageCircle size={11} /> {review.comments}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center gap-1">
                            {["←", 1, 3, 4, "…", 18, "→"].map((p, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className={cn(
                                        "w-7 h-7 rounded-lg text-xs font-bold border transition-all",
                                        p === 3
                                            ? "bg-green-600 border-green-600 text-white"
                                            : "bg-white border-gray-200 text-gray-400 hover:border-green-300"
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {relatedMenus.length > 0 && (
                <section>
                    <h2 className="font-[Poppins] font-bold text-xl text-green-600 mb-5">
                        You May Also Like
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {relatedMenus.map((menu) => (
                            <MenuCard key={menu.id} menu={menu} />
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}
