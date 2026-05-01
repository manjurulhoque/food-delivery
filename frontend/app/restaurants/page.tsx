"use client";

import { MapPin, Clock3, ChevronRight } from "lucide-react";
import { FOODS, RESTAURANTS, LOCATIONS } from "@/lib/data";
import { Stars } from "@/components/stars";
import { useGetAvailableMenusQuery } from "@/lib/services/restaurant-api";

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
};

const cuisineByRestaurant: Record<string, string> = {
    "Giovanni Restaurant": "Italian",
    "Senzo Restaurant": "Mediterranean",
    Naporitan: "Fast Food",
    Giovani: "Fusion",
    Shandy: "Street Food",
};

const dummyRestaurants: RestaurantCard[] = RESTAURANTS.map((restaurant, index) => {
    const foods = FOODS.filter((food) => food.restaurant === restaurant);
    const totalReviews = foods.reduce((sum, food) => sum + food.reviews, 0);
    const weightedRating = foods.reduce((sum, food) => sum + food.rating * food.reviews, 0);
    const averageRating = totalReviews ? weightedRating / totalReviews : 4.2;
    const fastestEta = foods.length ? `${Math.min(...foods.map((food) => Number(food.deliveryTime.split("-")[0])))}-${Math.max(...foods.map((food) => Number(food.deliveryTime.split("-")[1])))} min` : "20-35 min";

    return {
        id: index + 1,
        name: restaurant,
        location: foods[0]?.location || LOCATIONS[index % LOCATIONS.length],
        eta: fastestEta,
        rating: Number(averageRating.toFixed(1)),
        reviews: totalReviews || 25 + index * 11,
        cuisine: cuisineByRestaurant[restaurant] || "Mixed",
        featuredDish: foods[0]?.name || "Chef Special",
        minOrder: 20 + index * 5,
        isOpen: index % 4 !== 0,
    };
});

export default function RestaurantsPage() {
    const openCount = dummyRestaurants.filter((restaurant) => restaurant.isOpen).length;
    const { data: availableMenusResponse } = useGetAvailableMenusQuery();
    const availableMenusCount = availableMenusResponse?.data?.length ?? 0;

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
                        <StatCard label="Total Restaurants" value={String(dummyRestaurants.length)} />
                        <StatCard label="Open Now" value={String(openCount)} />
                        <StatCard label="Average Rating" value="4.5+" />
                        <StatCard
                            label="Menus Available"
                            value={availableMenusCount > 0 ? String(availableMenusCount) : String(LOCATIONS.length)}
                        />
                    </div>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-5 py-8">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-gray-500">Quick Filters:</span>
                    {["Top Rated", "Fast Delivery", "Budget Friendly", "Open Now"].map((filter) => (
                        <button
                            key={filter}
                            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600 transition-colors"
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-5 pb-10">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dummyRestaurants.map((restaurant) => (
                        <article
                            key={restaurant.id}
                            className="bg-white rounded-2xl border border-gray-100 p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
                        >
                            <div className="flex items-start justify-between gap-3 mb-4">
                                <div>
                                    <h2 className="font-[Poppins] font-bold text-lg text-gray-900">{restaurant.name}</h2>
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
                                    Min. order <span className="text-green-600 font-bold">${restaurant.minOrder}</span>
                                </p>
                                <button className="text-xs font-bold text-green-600 hover:text-green-700 inline-flex items-center gap-1 transition-colors">
                                    View Menu
                                    <ChevronRight size={13} />
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-5 pb-8">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-6 flex items-center justify-between gap-5">
                    <div>
                        <h3 className="font-[Poppins] font-bold text-xl text-gray-900 mb-2">Want your restaurant listed here?</h3>
                        <p className="text-sm text-gray-500 max-w-xl">
                            Join our partner network and start receiving orders from thousands of hungry customers in your area.
                        </p>
                    </div>
                    <button className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors">
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
