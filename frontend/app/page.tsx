"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { FOODS, CATEGORIES } from "@/lib/data";
import { FoodCard } from "@/components/food-card";
import { CategoryTabs } from "@/components/category-tabs";
import { Stars } from "@/components/stars";

export default function HomePage() {
    const [popularCat, setPopularCat] = useState("Pizza");
    const [newestCat, setNewestCat] = useState("Pasta");

    const popularFoods = FOODS.filter((f) => f.category === popularCat).slice(0, 4);
    const newestFoods = FOODS.filter((f) => f.category === newestCat).slice(0, 4);
    const featuredFood = FOODS.find((f) => f.name === "Grilled Chicken") || FOODS[8];

    return (
        <main>
            {/* ─── Hero ──────────────────────────────── */}
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
                            <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 rounded-lg transition-colors">
                                Find Food
                            </button>
                        </div>
                    </div>
                    <div className="hidden md:block text-8xl z-10 select-none">🛵</div>
                </div>
            </section>

            {/* ─── Popular Dishes ──────────────────────────────── */}
            <section className="max-w-6xl mx-auto px-5 py-10">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-[Poppins] font-bold text-xl text-green-600">Popular Dishes</h2>
                </div>
                <div className="mb-5">
                    <CategoryTabs active={popularCat} onSelect={setPopularCat} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {popularFoods.map((food) => (
                        <FoodCard key={food.id} food={food} />
                    ))}
                </div>
            </section>

            {/* ─── Featured Deal ──────────────────────────────── */}
            <section className="max-w-6xl mx-auto px-5 mb-10">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100 flex gap-6 items-center">
                    <div className="text-7xl shrink-0 select-none">{featuredFood.emoji}</div>
                    <div className="flex-1">
                        <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                            20% off for today&apos;s ordering!
                        </span>
                        <h3 className="font-[Poppins] font-bold text-2xl mb-1">{featuredFood.name}</h3>
                        <p className="text-sm text-gray-400 mb-3">{featuredFood.restaurant}</p>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-xl font-extrabold text-orange-500">${(featuredFood.price * 0.8).toFixed(0)}.00</span>
                            <span className="text-sm text-gray-400 line-through">${featuredFood.price}.00</span>
                            <Stars rating={featuredFood.rating} size={13} />
                            <span className="text-xs text-gray-400">({featuredFood.reviews})</span>
                        </div>
                        <div className="flex gap-3">
                            <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors">
                                Add to Bag
                            </button>
                            <a
                                href="/menu"
                                className="border border-gray-200 hover:border-gray-300 text-sm font-semibold px-5 py-2 rounded-lg transition-colors text-gray-600"
                            >
                                View All
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Popular Restaurants ──────────────────────────────── */}
            <section className="max-w-6xl mx-auto px-5 mb-10">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-[Poppins] font-bold text-xl text-green-600">Our Popular Restaurants</h2>
                    <button className="bg-green-50 text-green-700 text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-green-100 transition-colors">
                        View Restaurants
                    </button>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6 flex gap-6 items-start">
                    <div className="flex-1">
                        <p className="text-sm text-gray-500 leading-relaxed mb-4">
                            Foody with more than 1000 Restaurants! We&apos;re proud to announce that our platform has partnered with
                            more than 1000 restaurants. Customers can find at least one restaurant in vicinity of their neighborhood
                            and we will provide them with great satisfaction.
                        </p>
                        <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors">
                            View Restaurants
                        </button>
                    </div>
                    <div className="w-40 h-28 bg-green-50 rounded-xl flex items-center justify-center text-5xl shrink-0">
                        🏪
                    </div>
                </div>
            </section>

            {/* ─── Newest Dishes ──────────────────────────────── */}
            <section className="max-w-6xl mx-auto px-5 mb-10">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-[Poppins] font-bold text-xl text-green-600">Newest Dishes</h2>
                </div>
                <div className="mb-5">
                    <CategoryTabs active={newestCat} onSelect={setNewestCat} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {newestFoods.map((food) => (
                        <FoodCard key={food.id} food={food} />
                    ))}
                </div>
            </section>

            {/* ─── About Us ──────────────────────────────── */}
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
