"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, MapPin, ChefHat, Package, ThumbsUp, MessageCircle } from "lucide-react";
import { FOODS } from "@/lib/data";
import { FoodCard } from "@/components/food-card";
import { Stars } from "@/components/stars";
import { cn } from "@/lib/utils";

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

export default function FoodDetailPage() {
    const { id } = useParams();
    const food = FOODS.find((f) => f.id === Number(id));

    if (!food) return notFound();

    const [qty, setQty] = useState(1);
    const [tab, setTab] = useState<"Description" | "Reviews">("Description");
    const [selectedImage, setSelectedImage] = useState(0);

    const related = FOODS.filter((f) => f.category === food.category && f.id !== food.id).slice(0, 4);

    return (
        <main className="max-w-6xl mx-auto px-5 py-6">
            {/* Back */}
            <Link
                href="/menu"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 mb-6 transition-colors"
            >
                <ArrowLeft size={14} />
                Back to Menu
            </Link>

            {/* ─── Main Grid ─────────────────── */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Image panel */}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center gap-4">
                    <div className="w-full h-56 flex items-center justify-center">
                        <span className="text-9xl select-none">{food.emoji}</span>
                    </div>
                    <div className="flex gap-2">
                        {[0, 1, 2, 3].map((i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedImage(i)}
                                className={cn(
                                    "w-12 h-12 rounded-lg flex items-center justify-center text-2xl border-2 transition-all",
                                    selectedImage === i ? "border-green-500 bg-green-50" : "border-gray-100 bg-gray-50"
                                )}
                            >
                                {food.emoji}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Info panel */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-start justify-between mb-2">
                        <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                            Available
                        </span>
                    </div>
                    <h1 className="font-[Poppins] font-bold text-2xl text-gray-900 mb-4">{food.name}</h1>

                    {/* Meta info */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 mb-5">
                        <div className="flex items-center gap-2">
                            <Clock size={15} className="text-green-600 shrink-0" />
                            <span className="text-sm text-gray-500">{food.deliveryTime} min delivery time</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Stars rating={food.rating} size={13} />
                            <span className="text-sm font-bold text-gray-800">{food.rating}</span>
                            <span className="text-xs text-gray-400">({food.reviews} Ratings)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Package size={15} className="text-green-600 shrink-0" />
                            <span className="text-sm text-gray-500">On Offer</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ChefHat size={15} className="text-green-600 shrink-0" />
                            <span className="text-sm font-semibold text-gray-800">{food.restaurant}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={15} className="text-green-600 shrink-0" />
                            <span className="text-sm text-gray-500">{food.location}</span>
                        </div>
                    </div>

                    {/* Ingredients */}
                    <div className="mb-5">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Ingredients</p>
                        <div className="flex flex-wrap gap-1.5">
                            {food.ingredients.map((ing) => (
                                <span key={ing} className="bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                                    {ing}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Price + Qty + CTA */}
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-extrabold text-orange-500">${food.price}.00</span>
                        <div className="flex items-center gap-2 bg-green-50 rounded-lg px-2 py-1">
                            <button
                                onClick={() => setQty((q) => Math.max(1, q - 1))}
                                className="w-6 h-6 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-bold flex items-center justify-center transition-colors"
                            >
                                −
                            </button>
                            <span className="text-sm font-extrabold w-5 text-center text-gray-800">{qty}</span>
                            <button
                                onClick={() => setQty((q) => q + 1)}
                                className="w-6 h-6 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-bold flex items-center justify-center transition-colors"
                            >
                                +
                            </button>
                        </div>
                        <button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
                            Add to Bag
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── Description / Reviews Tabs ─────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
                {/* Tabs */}
                <div className="flex border-b border-gray-100 mb-5">
                    {(["Description", "Reviews"] as const).map((t) => (
                        <button
                            key={t}
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
                    <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">{food.description}</p>
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
                                            <span className="text-sm font-bold text-gray-800">{review.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Stars rating={review.rating} size={11} />
                                            <span className="text-xs font-bold text-amber-500">{review.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed mb-3">{review.text}</p>
                                    <div className="flex gap-4">
                                        <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-600 transition-colors">
                                            <ThumbsUp size={11} /> {review.likes}
                                        </button>
                                        <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-600 transition-colors">
                                            <MessageCircle size={11} /> {review.comments}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Review pagination */}
                        <div className="flex justify-center gap-1">
                            {["←", 1, 3, 4, "…", 18, "→"].map((p, i) => (
                                <button
                                    key={i}
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

            {/* ─── You May Also Like ─────────────────── */}
            {related.length > 0 && (
                <section>
                    <h2 className="font-[Poppins] font-bold text-xl text-green-600 mb-5">You May Also Like</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {related.map((f) => (
                            <FoodCard key={f.id} food={f} />
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}
