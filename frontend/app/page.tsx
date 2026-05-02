"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { MenuCard } from "@/components/menu-card";
import { CategoryTabs } from "@/components/category-tabs";
import { Stars } from "@/components/stars";
import { Menu } from "@/lib/types/menu";
import { resolveMenuImageUrl } from "@/lib/menu-image";
import {
    useGetAvailableMenusQuery,
    useGetMenuCategoriesQuery,
    useGetRestaurantsQuery,
    type AvailableMenu,
} from "@/lib/services/restaurant-api";
import { FOODY_MENU_PLACEHOLDER_SRC } from "@/components/foody-menu-placeholder";

const MENU_EMOJIS = ["🍕", "🍝", "🍗", "🥩", "🐟"];

function toMenuCardModel(menu: AvailableMenu): Menu {
    return {
        id: menu.id,
        name: menu.name,
        category: menu.category?.name ?? "Uncategorized",
        price: Math.round(menu.price),
        emoji: MENU_EMOJIS[menu.id % MENU_EMOJIS.length],
        image_path: menu.image_path,
        restaurant: menu.restaurant.name,
        rating: 4.5,
        reviews: 100 + menu.id,
        deliveryTime: "20-35",
        description: menu.name,
        ingredients: [],
        location: menu.restaurant.address,
    };
}

function FeaturedSpotlight({ menu }: { menu: Menu }) {
    const showPhoto = Boolean(menu.image_path);
    const showPlaceholder = menu.image_path === null || menu.image_path === "";

    return (
        <div className="text-7xl shrink-0 select-none flex items-center justify-center w-[7rem] h-[7rem]">
            {showPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={resolveMenuImageUrl(menu.image_path) ?? ""}
                    alt={menu.name}
                    className="w-full h-full object-cover rounded-2xl"
                />
            ) : showPlaceholder ? (
                <Image
                    src={FOODY_MENU_PLACEHOLDER_SRC}
                    alt=""
                    width={112}
                    height={112}
                    className="rounded-2xl"
                    unoptimized
                />
            ) : (
                <span className="text-7xl">{menu.emoji}</span>
            )}
        </div>
    );
}

export default function HomePage() {
    const [popularCat, setPopularCat] = useState("All");
    const [newestCat, setNewestCat] = useState("All");

    const { data: menusResponse, isLoading: menusLoading, isError: menusError } = useGetAvailableMenusQuery({
        page_size: 100,
    });
    const { data: categoriesData } = useGetMenuCategoriesQuery();
    const { data: restaurantsResponse, isLoading: restaurantsLoading } = useGetRestaurantsQuery();

    const tabCategories = useMemo(
        () => ["All", ...(categoriesData?.data?.map((c) => c.name) ?? [])],
        [categoriesData]
    );

    const menus = useMemo(() => {
        const menus = menusResponse?.data ?? [];
        return menus.map(toMenuCardModel);
    }, [menusResponse]);

    const popularMenus = useMemo(() => {
        let list = menus;
        if (popularCat !== "All") list = list.filter((f) => f.category === popularCat);
        return [...list].sort((a, b) => b.reviews - a.reviews).slice(0, 4);
    }, [menus, popularCat]);

    const newestMenus = useMemo(() => {
        const menus = menusResponse?.data ?? [];
        let list = [...menus].sort(
            (a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime()
        );
        if (newestCat !== "All") {
            list = list.filter((m) => (m.category?.name ?? "Uncategorized") === newestCat);
        }
        return list.slice(0, 4).map(toMenuCardModel);
    }, [menusResponse, newestCat]);

    const featuredMenu = useMemo(() => {
        const menus = menusResponse?.data ?? [];
        if (menus.length === 0) return null;
        const top = [...menus].sort((a, b) => b.price - a.price)[0];
        return top ? toMenuCardModel(top) : null;
    }, [menusResponse]);

    const restaurantCount = restaurantsResponse?.data?.length ?? 0;
    const menuCount = menusResponse?.pagination?.count ?? menusResponse?.data?.length ?? 0;

    const showGridSkeleton = menusLoading && !menusResponse;

    return (
        <main>
            <section className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
                <div className="max-w-6xl mx-auto px-5 py-10 flex items-center gap-8">
                    <div className="flex-1 z-10">
                        <h1 className="font-[Poppins] font-bold text-3xl md:text-4xl text-white leading-tight mb-3">
                            Fastest Delivery
                            <br />& Easy Pickup
                        </h1>
                        <p className="text-green-100 text-sm mb-6 max-w-xs">
                            When you are lazy too cook, we are just a click away!
                        </p>
                        <div className="flex gap-2 bg-white/15 rounded-xl p-1.5 max-w-sm">
                            <div className="flex-1 bg-white rounded-lg px-3 py-2 flex items-center gap-2">
                                <MapPin size={14} className="text-gray-400 shrink-0" />
                                <input
                                    placeholder="Enter Delivery Address"
                                    className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-400"
                                />
                            </div>
                            <Link
                                href="/menu"
                                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 rounded-lg transition-colors inline-flex items-center"
                            >
                                Find Food
                            </Link>
                        </div>
                    </div>
                    <div className="hidden md:block text-8xl z-10 select-none">🛵</div>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-5 py-10">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-[Poppins] font-bold text-xl text-green-600">Popular Dishes</h2>
                    <Link href="/menu" className="text-xs font-bold text-green-600 hover:text-green-700">
                        See all
                    </Link>
                </div>
                <div className="mb-5">
                    <CategoryTabs active={popularCat} onSelect={setPopularCat} categories={tabCategories} />
                </div>
                {menusError && (
                    <p className="text-sm text-red-500 mb-4">Could not load menus. Try again later.</p>
                )}
                {showGridSkeleton ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-52 rounded-2xl bg-gray-100 animate-pulse border border-gray-100" />
                        ))}
                    </div>
                ) : popularMenus.length === 0 ? (
                    <p className="text-sm text-gray-500 py-8 text-center">
                        No dishes in this category yet.{" "}
                        <Link href="/menu" className="font-semibold text-green-600">
                            Browse full menu
                        </Link>
                    </p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {popularMenus.map((menu) => (
                            <MenuCard key={menu.id} menu={menu} />
                        ))}
                    </div>
                )}
            </section>

            <section className="max-w-6xl mx-auto px-5 mb-10">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100 flex gap-6 items-center">
                    {!featuredMenu ? (
                        <div className="flex flex-col md:flex-row gap-6 items-center w-full justify-center py-6 text-gray-500 text-sm">
                            {menusLoading ? "Loading featured dish…" : "Add menus in the admin to highlight a featured dish here."}
                        </div>
                    ) : (
                        <>
                            <FeaturedSpotlight menu={featuredMenu} />
                            <div className="flex-1 min-w-0">
                                <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                                    20% off for today&apos;s ordering!
                                </span>
                                <h3 className="font-[Poppins] font-bold text-2xl mb-1 truncate">{featuredMenu.name}</h3>
                                <p className="text-sm text-gray-400 mb-3 truncate">{featuredMenu.restaurant}</p>
                                <div className="flex items-center gap-3 mb-4 flex-wrap">
                                    <span className="text-xl font-extrabold text-orange-500">
                                        ${(featuredMenu.price * 0.8).toFixed(0)}.00
                                    </span>
                                    <span className="text-sm text-gray-400 line-through">${featuredMenu.price}.00</span>
                                    <Stars rating={featuredMenu.rating} size={13} />
                                    <span className="text-xs text-gray-400">({featuredMenu.reviews})</span>
                                </div>
                                <div className="flex gap-3 flex-wrap">
                                    <Link
                                        href={`/food/${featuredMenu.id}`}
                                        className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors inline-flex items-center justify-center"
                                    >
                                        View dish
                                    </Link>
                                    <Link
                                        href="/menu"
                                        className="border border-gray-200 hover:border-gray-300 text-sm font-semibold px-5 py-2 rounded-lg transition-colors text-gray-600 inline-flex items-center justify-center"
                                    >
                                        View All
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-5 mb-10">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-[Poppins] font-bold text-xl text-green-600">Our Popular Restaurants</h2>
                    <Link
                        href="/restaurants"
                        className="bg-green-50 text-green-700 text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                    >
                        View Restaurants
                    </Link>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6 flex gap-6 items-start">
                    <div className="flex-1">
                        <p className="text-sm text-gray-500 leading-relaxed mb-4">
                            Foody partners with{" "}
                            <span className="font-semibold text-gray-700">
                                {restaurantsLoading ? "…" : restaurantCount}
                            </span>{" "}
                            restaurant{restaurantCount === 1 ? "" : "s"} and lists{" "}
                            <span className="font-semibold text-gray-700">{menuCount}</span> menu
                            {menuCount === 1 ? "" : "s"}. Browse nearby kitchens and order with delivery you can trust.
                        </p>
                        <Link
                            href="/restaurants"
                            className="inline-flex bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors"
                        >
                            View Restaurants
                        </Link>
                    </div>
                    <div className="w-40 h-28 bg-green-50 rounded-xl flex items-center justify-center text-5xl shrink-0">
                        🏪
                    </div>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-5 mb-10">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-[Poppins] font-bold text-xl text-green-600">Newest Dishes</h2>
                    <Link href="/menu" className="text-xs font-bold text-green-600 hover:text-green-700">
                        See all
                    </Link>
                </div>
                <div className="mb-5">
                    <CategoryTabs active={newestCat} onSelect={setNewestCat} categories={tabCategories} />
                </div>
                {showGridSkeleton ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-52 rounded-2xl bg-gray-100 animate-pulse border border-gray-100" />
                        ))}
                    </div>
                ) : newestMenus.length === 0 ? (
                    <p className="text-sm text-gray-500 py-8 text-center">
                        No recent dishes in this category.{" "}
                        <Link href="/menu" className="font-semibold text-green-600">
                            Open menu
                        </Link>
                    </p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {newestMenus.map((menu) => (
                            <MenuCard key={`new-${menu.id}`} menu={menu} />
                        ))}
                    </div>
                )}
            </section>

            <section className="max-w-6xl mx-auto px-5 mb-10">
                <div className="bg-white rounded-2xl border border-gray-100 p-8 flex gap-8 items-center">
                    <div className="w-32 h-32 bg-amber-50 rounded-2xl flex items-center justify-center text-5xl shrink-0">
                        🚗
                    </div>
                    <div>
                        <h2 className="font-[Poppins] font-bold text-xl text-green-600 mb-3">About Us</h2>
                        <h3 className="font-bold text-lg mb-2">We have provided a quality driver</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            You don&apos;t need to worry about your food, because our driver has been tested for his honesty and speed
                            in delivering your food safely on in 30 minutes! Enjoy your food.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
