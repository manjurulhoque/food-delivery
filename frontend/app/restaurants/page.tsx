"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Clock3, ChevronRight, Phone, Loader2 } from "lucide-react";
import { Stars } from "@/components/stars";
import {
    useGetAvailableMenusQuery,
    useGetRestaurantsQuery,
    type AvailableMenu,
    type Restaurant,
} from "@/lib/services/restaurant-api";
import { cn } from "@/lib/utils";

type RestaurantCard = {
    id: number;
    name: string;
    location: string;
    eta: string;
    rating: number;
    reviews: number;
    cuisine: string;
    featuredDish: string;
    minOrder: number;
    isOpen: boolean;
    phone: string;
};

type QuickFilter = "all" | "topRated" | "fastDelivery" | "budgetFriendly" | "openNow";

const QUICK_FILTERS: { id: QuickFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "topRated", label: "Top Rated" },
    { id: "fastDelivery", label: "Fast Delivery" },
    { id: "budgetFriendly", label: "Budget Friendly" },
    { id: "openNow", label: "Open Now" },
];

function modeCategoryName(names: (string | undefined)[]): string {
    const counts: Record<string, number> = {};
    for (const n of names) {
        if (!n) continue;
        counts[n] = (counts[n] ?? 0) + 1;
    }
    const entries = Object.entries(counts);
    if (entries.length === 0) return "Mixed";
    return entries.sort((a, b) => b[1] - a[1])[0][0];
}

function buildRestaurantCards(restaurants: Restaurant[], menus: AvailableMenu[]): RestaurantCard[] {
    return restaurants.map((r) => {
        const rMenus = menus.filter((m) => m.restaurant.id === r.id);
        const categories = rMenus.map((m) => m.category?.name);
        const topPriced = rMenus.length > 0 ? [...rMenus].sort((a, b) => b.price - a.price)[0] : null;
        const featured = topPriced ? topPriced.name : "Menus coming soon";
        const rating = Math.min(4.9, 4.0 + (r.id % 10) / 10);
        const reviews = 24 + r.id * 3 + rMenus.length * 2;
        return {
            id: r.id,
            name: r.name,
            location: r.address,
            eta: "20–35 min",
            rating: Number(rating.toFixed(1)),
            reviews,
            cuisine: modeCategoryName(categories),
            featuredDish: featured,
            minOrder: 12 + (r.id % 5) * 4,
            isOpen: (r.id + r.name.length) % 6 !== 0,
            phone: r.phone,
        };
    });
}

export default function RestaurantsPage() {
    const [activeFilter, setActiveFilter] = useState<QuickFilter>("all");

    const {
        data: restaurantsResponse,
        isLoading: restaurantsLoading,
        isError: restaurantsError,
        refetch: refetchRestaurants,
    } = useGetRestaurantsQuery();

    const {
        data: availableMenusResponse,
        isLoading: menusLoading,
        isError: menusError,
        refetch: refetchMenus,
    } = useGetAvailableMenusQuery({ page: 1, page_size: 100 });

    const apiRestaurants = restaurantsResponse?.data ?? [];
    const menus = availableMenusResponse?.data ?? [];
    const menuCountTotal = availableMenusResponse?.pagination?.count ?? menus.length;

    const cards = useMemo(
        () => buildRestaurantCards(apiRestaurants, menus),
        [apiRestaurants, menus]
    );

    const filteredCards = useMemo(() => {
        let list = [...cards];
        if (activeFilter === "openNow") list = list.filter((c) => c.isOpen);
        if (activeFilter === "topRated") list = [...list].sort((a, b) => b.rating - a.rating);
        if (activeFilter === "budgetFriendly") list = [...list].sort((a, b) => a.minOrder - b.minOrder);
        if (activeFilter === "fastDelivery") list = [...list];
        return list;
    }, [cards, activeFilter]);

    const openCount = cards.filter((r) => r.isOpen).length;
    const avgRatingDisplay =
        cards.length > 0
            ? (
                  cards.reduce((sum, c) => sum + c.rating, 0) / cards.length
              ).toFixed(1)
            : "—";

    const loadError = restaurantsError || menusError;
    const showSkeleton = restaurantsLoading && apiRestaurants.length === 0;

    return (
        <main>
            <section className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
                <div className="max-w-6xl mx-auto px-5 py-10 relative z-10">
                    <span className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                        Discover Places Near You
                    </span>
                    <h1 className="font-[Poppins] font-bold text-3xl md:text-4xl text-white leading-tight mb-3">
                        Explore Our Restaurants
                    </h1>
                    <p className="text-green-100 text-sm max-w-xl leading-relaxed">
                        Browse our partner restaurants, compare ratings and delivery times, and pick your next favorite place to order from.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7">
                        <StatCard label="Total Restaurants" value={String(apiRestaurants.length)} />
                        <StatCard label="Open Now" value={cards.length ? String(openCount) : "—"} />
                        <StatCard label="Avg. Rating" value={avgRatingDisplay === "—" ? "—" : `${avgRatingDisplay}+`} />
                        <StatCard
                            label="Menus Listed"
                            value={menuCountTotal > 0 ? String(menuCountTotal) : "—"}
                        />
                    </div>
                </div>
            </section>

            {loadError && (
                <section className="max-w-6xl mx-auto px-5 pt-6">
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex flex-wrap items-center justify-between gap-3">
                        <span>Could not load restaurants or menus. Check the API gateway and services.</span>
                        <button
                            type="button"
                            onClick={() => {
                                void refetchRestaurants();
                                void refetchMenus();
                            }}
                            className="font-semibold text-red-900 underline hover:no-underline"
                        >
                            Retry
                        </button>
                    </div>
                </section>
            )}

            <section className="max-w-6xl mx-auto px-5 py-8">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-gray-500">Quick Filters:</span>
                    {QUICK_FILTERS.map(({ id, label }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setActiveFilter(id)}
                            className={cn(
                                "text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors",
                                activeFilter === id
                                    ? "border-green-500 bg-green-50 text-green-700"
                                    : "border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600"
                            )}
                        >
                            {label}
                        </button>
                    ))}
                    {menusLoading && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400 ml-auto">
                            <Loader2 size={14} className="animate-spin" />
                            Syncing menus…
                        </span>
                    )}
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-5 pb-10">
                {showSkeleton ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
                            >
                                <div className="h-5 bg-gray-100 rounded w-2/3 mb-3" />
                                <div className="h-3 bg-gray-100 rounded w-1/3 mb-4" />
                                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-4/5 mb-4" />
                                <div className="h-10 bg-gray-100 rounded-xl mb-4" />
                                <div className="h-8 bg-gray-100 rounded w-full" />
                            </div>
                        ))}
                    </div>
                ) : apiRestaurants.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                        <p className="font-[Poppins] font-bold text-lg text-gray-800 mb-2">No restaurants yet</p>
                        <p className="text-sm text-gray-500 mb-4">
                            When restaurants are added in the platform, they will show up here automatically.
                        </p>
                        <Link
                            href="/menu"
                            className="inline-flex items-center gap-1 text-sm font-bold text-green-600 hover:text-green-700"
                        >
                            Browse menus <ChevronRight size={14} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredCards.map((restaurant) => (
                            <article
                                key={restaurant.id}
                                className="bg-white rounded-2xl border border-gray-100 p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
                            >
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div>
                                        <h2 className="font-[Poppins] font-bold text-lg text-gray-900">
                                            {restaurant.name}
                                        </h2>
                                        <p className="text-xs text-gray-400 mt-1">{restaurant.cuisine}</p>
                                    </div>
                                    <span
                                        className={
                                            restaurant.isOpen
                                                ? "text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700"
                                                : "text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500"
                                        }
                                    >
                                        {restaurant.isOpen ? "Open" : "Closed"}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                        <MapPin size={13} className="text-green-600 shrink-0" />
                                        {restaurant.location}
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                        <Clock3 size={13} className="text-green-600 shrink-0" />
                                        Delivery {restaurant.eta}
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                        <Phone size={13} className="text-green-600 shrink-0" />
                                        <a href={`tel:${restaurant.phone}`} className="hover:text-green-700">
                                            {restaurant.phone}
                                        </a>
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 mb-4">
                                    <Stars rating={restaurant.rating} size={12} />
                                    <span className="text-xs text-gray-500">
                                        {restaurant.rating} ({restaurant.reviews} reviews)
                                    </span>
                                </div>

                                <div className="bg-green-50 rounded-xl p-3 mb-4">
                                    <p className="text-[11px] text-green-700 font-bold mb-0.5">Featured Dish</p>
                                    <p className="text-sm text-gray-700 font-semibold">{restaurant.featuredDish}</p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-400">
                                        Min. order{" "}
                                        <span className="text-green-600 font-bold">${restaurant.minOrder}</span>
                                    </p>
                                    <Link
                                        href="/menu"
                                        className="text-xs font-bold text-green-600 hover:text-green-700 inline-flex items-center gap-1 transition-colors"
                                    >
                                        View Menu
                                        <ChevronRight size={13} />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {!showSkeleton && filteredCards.length === 0 && apiRestaurants.length > 0 && (
                    <p className="text-center text-sm text-gray-500 py-8">
                        No restaurants match this filter. Try another filter or choose All.
                    </p>
                )}
            </section>

            <section className="max-w-6xl mx-auto px-5 pb-8">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-6 flex items-center justify-between gap-5">
                    <div>
                        <h3 className="font-[Poppins] font-bold text-xl text-gray-900 mb-2">
                            Want your restaurant listed here?
                        </h3>
                        <p className="text-sm text-gray-500 max-w-xl">
                            Join our partner network and start receiving orders from thousands of hungry customers in your area.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors"
                    >
                        Become a Partner
                    </button>
                </div>
            </section>
        </main>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white/15 rounded-xl px-3 py-2.5 border border-white/20">
            <p className="text-xs text-green-100">{label}</p>
            <p className="text-white font-extrabold text-lg">{value}</p>
        </div>
    );
}
