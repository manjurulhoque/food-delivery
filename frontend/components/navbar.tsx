"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ShoppingCart, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const isAuthenticated = status === "authenticated";
    const role = session?.user?.is_restaurant
        ? "Restaurant"
        : session?.user?.is_driver
            ? "Driver"
            : "Customer";
    const links = [
        { label: "Home", href: "/" },
        { label: "Menu", href: "/menu" },
        { label: "Restaurants", href: "/restaurants" },
        { label: "Offers", href: "/offers" },
    ];

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
                    <button className="relative text-gray-500 hover:text-gray-800 transition-colors mr-10">
                        <ShoppingCart size={18} />
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                            3
                        </span>
                    </button>
                    {isAuthenticated ? (
                        <>
                            <div className="hidden lg:flex flex-col items-end leading-tight">
                                <span className="text-xs font-semibold text-gray-700">{session.user.email}</span>
                                <span className="text-[11px] text-green-600 font-bold">{role}</span>
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
