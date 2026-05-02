"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { ShoppingCart, Search, ChevronDown, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { FOODY_BAG_UPDATED_EVENT, getBagCount } from "@/lib/bag";

export function Navbar() {
    const pathname = usePathname();
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);
    const [bagCount, setBagCount] = useState(0);
    const { data: session, status } = useSession();
    const isAuthenticated = status === "authenticated";
    const role = session?.user?.is_superuser
        ? "Admin"
        : session?.user?.is_restaurant
            ? "Restaurant"
            : session?.user?.is_driver
                ? "Driver"
                : "Customer";
    const dashboardLinks = useMemo(() => {
        if (!session?.user) return [];

        if (session.user.is_superuser) {
            return [
                { label: "Admin Dashboard", href: "/dashboard/admin" },
                { label: "Restaurant Dashboard", href: "/dashboard/restaurant" },
                { label: "Driver Dashboard", href: "/dashboard/driver" },
                { label: "Customer Dashboard", href: "/dashboard/customer" },
            ];
        }

        if (session.user.is_restaurant) {
            return [{ label: "Restaurant Dashboard", href: "/dashboard/restaurant" }];
        }

        if (session.user.is_driver) {
            return [{ label: "Driver Dashboard", href: "/dashboard/driver" }];
        }

        return [{ label: "Customer Dashboard", href: "/dashboard/customer" }];
    }, [session]);
    const links = [
        { label: "Home", href: "/" },
        { label: "Menu", href: "/menu" },
        { label: "Restaurants", href: "/restaurants" },
        { label: "Offers", href: "/offers" },
    ];

    useEffect(() => {
        const updateBagCount = () => setBagCount(getBagCount());
        updateBagCount();
        window.addEventListener(FOODY_BAG_UPDATED_EVENT, updateBagCount);
        window.addEventListener("storage", updateBagCount);
        return () => {
            window.removeEventListener(FOODY_BAG_UPDATED_EVENT, updateBagCount);
            window.removeEventListener("storage", updateBagCount);
        };
    }, []);

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    <span className="text-xl font-extrabold font-[Poppins]">
                        <span className="text-green-600">F</span>
                        <span className="text-orange-500">o</span>
                        <span className="text-green-600">o</span>
                        <span className="text-orange-500">d</span>
                        <span className="text-green-600">y</span>
                    </span>
                </Link>

                <div className="hidden md:flex gap-6">
                    {links.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className={cn(
                                "text-sm font-semibold pb-0.5 border-b-2 transition-colors",
                                pathname === l.href
                                    ? "text-green-600 border-green-600"
                                    : "text-gray-400 border-transparent hover:text-gray-700"
                            )}
                        >
                            {l.label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <button className="text-gray-500 hover:text-gray-800 transition-colors">
                        <Search size={18} />
                    </button>
                    <Link
                        href="/cart"
                        className={cn(
                            "relative transition-colors mr-10",
                            pathname === "/cart"
                                ? "text-green-600"
                                : "text-gray-500 hover:text-gray-800"
                        )}
                    >
                        <ShoppingCart size={18} />
                        <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                            {bagCount}
                        </span>
                    </Link>
                    {isAuthenticated ? (
                        <>
                            <div className="hidden lg:flex flex-col items-end leading-tight">
                                <span className="text-xs font-semibold text-gray-700">{session.user.email}</span>
                                <span className="text-[11px] text-green-600 font-bold">{role}</span>
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => setIsDashboardOpen((open) => !open)}
                                    className={cn(
                                        "text-sm font-semibold pb-0.5 border-b-2 transition-colors inline-flex items-center gap-1",
                                        pathname.startsWith("/dashboard")
                                            ? "text-green-600 border-green-600"
                                            : "text-gray-400 border-transparent hover:text-gray-700"
                                    )}
                                >
                                    <LayoutDashboard size={15} />
                                    Dashboard
                                    <ChevronDown size={14} className={cn("transition-transform", isDashboardOpen && "rotate-180")} />
                                </button>
                                {isDashboardOpen && (
                                    <div className="absolute right-0 top-8 w-56 bg-white border border-gray-100 rounded-xl shadow-lg p-2 z-50">
                                        {dashboardLinks.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsDashboardOpen(false)}
                                                className={cn(
                                                    "block text-sm font-semibold rounded-lg px-3 py-2 transition-colors",
                                                    pathname === item.href
                                                        ? "bg-green-50 text-green-700"
                                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                                )}
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="text-sm font-semibold pb-0.5 border-b-2 transition-colors text-gray-400 border-transparent hover:text-gray-700"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className={cn(
                                    "text-sm font-semibold pb-0.5 border-b-2 transition-colors",
                                    pathname === "/login"
                                        ? "text-green-600 border-green-600"
                                        : "text-gray-400 border-transparent hover:text-gray-700"
                                )}
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className={cn(
                                    "text-sm font-semibold pb-0.5 border-b-2 transition-colors",
                                    pathname === "/register"
                                        ? "text-green-600 border-green-600"
                                        : "text-gray-400 border-transparent hover:text-gray-700"
                                )}
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
