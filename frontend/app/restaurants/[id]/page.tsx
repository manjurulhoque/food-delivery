"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { ArrowLeft, Clock3, MapPin, Phone } from "lucide-react";
import { MenuCard } from "@/components/menu-card";
import { CategoryTabs } from "@/components/category-tabs";
import { Stars } from "@/components/stars";
import {
    useGetRestaurantByIdQuery,
    useGetRestaurantMenusQuery,
} from "@/lib/services/restaurant-api";
import { enrichMenu } from "@/lib/menu-utils";

export default function RestaurantDetailPage() {
    const params = useParams();
    const idParam = params?.id;
    const restaurantId = typeof idParam === "string" ? parseInt(idParam, 10) : NaN;
    const isValidId = Number.isFinite(restaurantId) && restaurantId > 0;

    const [activeCategory, setActiveCategory] = useState("All");

    const {
        data: restaurantResponse,
        isLoading: restaurantLoading,
        isError: restaurantError,
    } = useGetRestaurantByIdQuery(restaurantId, { skip: !isValidId });

    const {
        data: menusResponse,
        isLoading: menusLoading,
        isError: menusError,
        refetch: refetchMenus,
    } = useGetRestaurantMenusQuery(restaurantId, { skip: !isValidId });

    const restaurant = restaurantResponse?.data ?? null;

    const menus = useMemo(() => {
        if (!restaurant) return [];
        const rows = menusResponse?.data ?? [];
        return rows.map((row) => enrichMenu(row, restaurant));
    }, [menusResponse, restaurant]);

    const categoryTabs = useMemo(() => {
        const names = menus
            .map((m) => m.category?.name)
            .filter((n): n is string => Boolean(n));
        return ["All", ...Array.from(new Set(names))];
    }, [menus]);

    const filteredMenus = useMemo(() => {
        if (activeCategory === "All") return menus;
        return menus.filter((m) => m.category?.name === activeCategory);
    }, [menus, activeCategory]);

    const rating = restaurant
        ? Number((4.0 + (restaurant.id % 10) / 10).toFixed(1))
        : 0;
    const reviews = restaurant ? 24 + restaurant.id * 3 + menus.length * 2 : 0;

    if (!isValidId) {
        notFound();
    }

    if (restaurantLoading) {
        return (
            <main className="max-w-6xl mx-auto px-5 py-6">
                <PageSkeleton />
            </main>
        );
    }

    if (restaurantError || !restaurant) {
        notFound();
    }

    return (
        <main>
            <section className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
                <div className="max-w-6xl mx-auto px-5 py-8 relative z-10">
                    <Link
                        href="/restaurants"
                        className="inline-flex items-center gap-1.5 text-green-100 text-sm font-semibold hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to restaurants
                    </Link>
                    <h1 className="font-[Poppins] font-bold text-3xl md:text-4xl text-white leading-tight mb-2">
                        {restaurant.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-green-100 text-sm mt-2">
                        <span className="inline-flex items-center gap-1.5">
                            <MapPin size={14} className="shrink-0" />
                            {restaurant.address}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Phone size={14} className="shrink-0" />
                            <a href={`tel:${restaurant.phone}`} className="hover:text-white">
                                {restaurant.phone}
                            </a>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Clock3 size={14} className="shrink-0" />
                            Delivery 25–35 min
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        <Stars rating={rating} size={14} />
                        <span className="text-sm text-green-100">
                            {rating} ({reviews} reviews)
                        </span>
                        <span className="text-green-200/80">·</span>
                        <span className="text-sm text-green-100 font-semibold">
                            {menus.length} menu item{menus.length === 1 ? "" : "s"}
                        </span>
                    </div>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-5 py-8">
                {categoryTabs.length > 1 && (
                    <div className="mb-6">
                        <CategoryTabs
                            active={activeCategory}
                            onSelect={setActiveCategory}
                            categories={categoryTabs}
                        />
                    </div>
                )}

                {menusError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex flex-wrap items-center justify-between gap-3 mb-6">
                        <span>Could not load this restaurant&apos;s menu.</span>
                        <button
                            type="button"
                            onClick={() => void refetchMenus()}
                            className="font-semibold text-red-900 underline hover:no-underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {menusLoading ? (
                    <MenuGridSkeleton />
                ) : filteredMenus.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {filteredMenus.map((menu) => (
                            <MenuCard key={menu.id} menu={menu} />
                        ))}
                    </div>
                ) : menus.length === 0 ? (
                    <EmptyMenuState />
                ) : (
                    <p className="text-center text-sm text-gray-500 py-8">
                        No items in this category. Try &quot;All&quot;.
                    </p>
                )}
            </section>
        </main>
    );
}

function PageSkeleton() {
    return (
        <>
            <div className="h-8 w-40 bg-gray-100 rounded mb-6 animate-pulse" />
            <div className="h-28 bg-gray-100 rounded-2xl mb-8 animate-pulse" />
            <MenuGridSkeleton />
        </>
    );
}

function MenuGridSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
        </div>
    );
}

function EmptyMenuState() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <p className="font-[Poppins] font-bold text-lg text-gray-800 mb-2">No menu items yet</p>
            <p className="text-sm text-gray-500 mb-4">
                This restaurant hasn&apos;t published dishes. Check back later or browse all menus.
            </p>
            <Link
                href="/menu"
                className="inline-flex text-sm font-bold text-green-600 hover:text-green-700"
            >
                Browse all menus
            </Link>
        </div>
    );
}
