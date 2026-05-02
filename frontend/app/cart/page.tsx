"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import {
    FOODY_BAG_UPDATED_EVENT,
    getBagItems,
    removeMenuFromBag,
    updateBagItemQuantity,
    type BagItem,
} from "@/lib/bag";
import { resolveMenuImageUrl } from "@/lib/menu-image";
import { FoodyMenuPlaceholder } from "@/components/foody-menu-placeholder";

const DELIVERY_FEE = 4.99;
const TAX_RATE = 0.08;

export default function CartPage() {
    const [items, setItems] = useState<BagItem[]>([]);

    useEffect(() => {
        const syncBag = () => setItems(getBagItems());
        syncBag();
        window.addEventListener(FOODY_BAG_UPDATED_EVENT, syncBag);
        window.addEventListener("storage", syncBag);
        return () => {
            window.removeEventListener(FOODY_BAG_UPDATED_EVENT, syncBag);
            window.removeEventListener("storage", syncBag);
        };
    }, []);

    const subtotal = useMemo(
        () => items.reduce((sum, item) => sum + Number(item.menu.price) * item.quantity, 0),
        [items]
    );
    const tax = subtotal * TAX_RATE;
    const total = subtotal > 0 ? subtotal + tax + DELIVERY_FEE : 0;

    return (
        <main>
            <section className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
                <div className="max-w-6xl mx-auto px-5 py-10 relative z-10">
                    <h1 className="font-[Poppins] font-bold text-3xl md:text-4xl text-white leading-tight mb-2">
                        Your Cart
                    </h1>
                    <p className="text-green-100 text-sm max-w-md">
                        Review your selected menus, adjust quantity, and proceed to checkout.
                    </p>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-5 py-8">
                {items.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-700 mx-auto mb-4 flex items-center justify-center">
                            <ShoppingBag size={24} />
                        </div>
                        <h2 className="font-[Poppins] font-bold text-xl text-gray-900 mb-2">
                            Your cart is empty
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">
                            Add some delicious menus from our collection.
                        </p>
                        <Link
                            href="/menu"
                            className="inline-flex items-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 px-5 transition-colors"
                        >
                            Browse Menu
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
                            <div className="space-y-3">
                                {items.map((item) => {
                                    const imageUrl = resolveMenuImageUrl(item.menu.image_path);
                                    return (
                                        <article
                                            key={item.menu.id}
                                            className="border border-gray-100 rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
                                        >
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#E8F7EF] flex items-center justify-center overflow-hidden shrink-0">
                                                {imageUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={imageUrl}
                                                        alt={item.menu.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <FoodyMenuPlaceholder
                                                        size={52}
                                                        label={item.menu.name}
                                                    />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {item.menu.name}
                                                </h3>
                                                <p className="text-xs text-gray-400 truncate">
                                                    {item.menu.restaurant?.name ?? ""}
                                                </p>
                                                <p className="text-sm font-extrabold text-green-600 mt-1">
                                                    ${Number(item.menu.price).toFixed(2)}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 bg-green-50 rounded-lg px-2 py-1 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateBagItemQuantity(
                                                            item.menu.id,
                                                            Math.max(1, item.quantity - 1)
                                                        )
                                                    }
                                                    className="w-6 h-6 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-bold flex items-center justify-center transition-colors"
                                                >
                                                    −
                                                </button>
                                                <span className="text-sm font-extrabold w-5 text-center text-gray-800">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateBagItemQuantity(
                                                            item.menu.id,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    className="w-6 h-6 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-bold flex items-center justify-center transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeMenuFromBag(item.menu.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                                aria-label={`Remove ${item.menu.name}`}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>

                        <aside className="bg-white rounded-2xl border border-gray-100 p-5 h-fit">
                            <h2 className="font-[Poppins] font-bold text-lg text-gray-900 mb-4">
                                Order Summary
                            </h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-500">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Tax (8%)</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Delivery fee</span>
                                    <span>${DELIVERY_FEE.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-100 pt-3 flex justify-between font-extrabold text-gray-900">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="mt-5 w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
                            >
                                Checkout
                            </button>
                            <Link
                                href="/menu"
                                className="mt-2 w-full inline-flex justify-center text-sm font-semibold text-green-700 hover:text-green-800"
                            >
                                Continue Shopping
                            </Link>
                        </aside>
                    </div>
                )}
            </section>
        </main>
    );
}
