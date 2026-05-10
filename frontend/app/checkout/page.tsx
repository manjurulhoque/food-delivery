"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, ShoppingBag } from "lucide-react";
import {
    FOODY_BAG_UPDATED_EVENT,
    clearBag,
    getBagItems,
    type BagItem,
} from "@/lib/bag";
import { useCreateOrderMutation } from "@/lib/services/order-api";
import { toast } from "@/hooks/use-toast";

const DELIVERY_FEE = 4.99;
const TAX_RATE = 0.08;

export default function CheckoutPage() {
    const [createOrder, { isLoading: isPlacingOrder }] = useCreateOrderMutation();
    const [items, setItems] = useState<BagItem[]>([]);
    const [isBagLoading, setIsBagLoading] = useState(true);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");
    const [isPlaced, setIsPlaced] = useState(false);

    useEffect(() => {
        const syncBag = () => {
            setItems(getBagItems());
            setIsBagLoading(false);
        };
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

    const onPlaceOrder: React.FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();
        if (items.length === 0) {
            toast({
                title: "Your bag is empty",
                description: "Add menu items before placing an order.",
                variant: "destructive",
            });
            return;
        }

        const restaurantId = items[0]?.menu.restaurant?.id;
        if (!restaurantId) {
            toast({
                title: "Missing restaurant data",
                description: "Please remove and add the item again before checkout.",
                variant: "destructive",
            });
            return;
        }

        try {
            await createOrder({
                restaurant_id: restaurantId,
                total_price: Number(total.toFixed(2)),
                items: items.map((item) => ({
                    menu_id: item.menu.id,
                    quantity: item.quantity,
                })),
            }).unwrap();

            clearBag();
            setItems([]);
            setIsPlaced(true);
            toast({
                title: "Order placed",
                description: "Your order has been submitted successfully.",
            });
        } catch (error) {
            let errorMessage = "Could not place order. Please try again.";

            toast({
                title: "Order failed",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    return (
        <main>
            <section className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
                <div className="max-w-6xl mx-auto px-5 py-10 relative z-10">
                    <h1 className="font-[Poppins] font-bold text-3xl md:text-4xl text-white leading-tight mb-2">
                        Checkout
                    </h1>
                    <p className="text-green-100 text-sm max-w-md">
                        Confirm your delivery details and place your order.
                    </p>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-5 py-8">
                {isBagLoading ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-10">
                        <div className="animate-pulse space-y-4">
                            <div className="h-6 w-44 bg-gray-100 rounded" />
                            <div className="h-12 w-full bg-gray-100 rounded-lg" />
                            <div className="h-12 w-full bg-gray-100 rounded-lg" />
                            <div className="h-24 w-full bg-gray-100 rounded-lg" />
                            <div className="h-10 w-40 bg-gray-100 rounded-lg" />
                        </div>
                    </div>
                ) : isPlaced ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-700 mx-auto mb-4 flex items-center justify-center">
                            <CheckCircle2 size={26} />
                        </div>
                        <h2 className="font-[Poppins] font-bold text-xl text-gray-900 mb-2">
                            Order placed successfully
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">
                            Thank you! Your order has been confirmed and will be prepared shortly.
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <Link
                                href="/menu"
                                className="inline-flex items-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 px-5 transition-colors"
                            >
                                Continue Ordering
                                <ChevronRight size={16} />
                            </Link>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 hover:border-gray-300 text-sm font-semibold py-2.5 px-5 transition-colors text-gray-600"
                            >
                                Back Home
                            </Link>
                        </div>
                    </div>
                ) : items.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-700 mx-auto mb-4 flex items-center justify-center">
                            <ShoppingBag size={24} />
                        </div>
                        <h2 className="font-[Poppins] font-bold text-xl text-gray-900 mb-2">
                            Your bag is empty
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">
                            Add menu items before you proceed to checkout.
                        </p>
                        <Link
                            href="/menu"
                            className="inline-flex items-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 px-5 transition-colors"
                        >
                            Browse Menu
                            <ChevronRight size={16} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-[1fr_340px] gap-6">
                        <form
                            className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6"
                            onSubmit={onPlaceOrder}
                        >
                            <h2 className="font-[Poppins] font-bold text-lg text-gray-900 mb-4">
                                Delivery Details
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <label className="block">
                                    <span className="text-xs font-bold text-gray-600 mb-1.5 block">
                                        Full Name
                                    </span>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-green-400 transition-colors"
                                        placeholder="Your full name"
                                        required
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-xs font-bold text-gray-600 mb-1.5 block">
                                        Phone Number
                                    </span>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(event) => setPhone(event.target.value)}
                                        className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-green-400 transition-colors"
                                        placeholder="+8801XXXXXXXXX"
                                        required
                                    />
                                </label>
                                <label className="block sm:col-span-2">
                                    <span className="text-xs font-bold text-gray-600 mb-1.5 block">
                                        Delivery Address
                                    </span>
                                    <textarea
                                        value={address}
                                        onChange={(event) => setAddress(event.target.value)}
                                        className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-green-400 transition-colors min-h-24"
                                        placeholder="House, road, area, city"
                                        required
                                    />
                                </label>
                            </div>

                            <h3 className="font-[Poppins] font-bold text-base text-gray-900 mt-6 mb-3">
                                Payment Method
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <label className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700">
                                    <input
                                        type="radio"
                                        name="payment"
                                        checked={paymentMethod === "cod"}
                                        onChange={() => setPaymentMethod("cod")}
                                        className="accent-green-600"
                                    />
                                    Cash on Delivery
                                </label>
                                <label className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700">
                                    <input
                                        type="radio"
                                        name="payment"
                                        checked={paymentMethod === "card"}
                                        onChange={() => setPaymentMethod("card")}
                                        className="accent-green-600"
                                    />
                                    Card Payment
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isPlacingOrder}
                                className="mt-6 w-full sm:w-auto bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-bold py-2.5 px-6 rounded-xl transition-colors cursor-pointer"
                            >
                                {isPlacingOrder ? "Placing..." : "Place Order"}
                            </button>
                        </form>

                        <aside className="bg-white rounded-2xl border border-gray-100 p-5 h-fit">
                            <h2 className="font-[Poppins] font-bold text-lg text-gray-900 mb-4">
                                Order Summary
                            </h2>
                            <div className="space-y-2 mb-4">
                                {items.map((item) => (
                                    <div
                                        key={item.menu.id}
                                        className="flex items-center justify-between text-sm text-gray-600"
                                    >
                                        <span className="truncate pr-3">
                                            {item.menu.name} x{item.quantity}
                                        </span>
                                        <span className="font-semibold text-gray-800">
                                            ${(item.quantity * Number(item.menu.price)).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
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
                        </aside>
                    </div>
                )}
            </section>
        </main>
    );
}
