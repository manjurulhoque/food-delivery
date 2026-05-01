"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Search, Star } from "lucide-react";
import { Food, CATEGORIES } from "@/lib/data";
import { cn } from "@/lib/utils";

// ─── Stars ────────────────────────────────────────────────────
export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.floor(rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
        />
      ))}
    </div>
  );
}

// ─── FoodCard ─────────────────────────────────────────────────
const emojiColors: Record<string, string> = {
  "🍕": "bg-red-50",
  "🍝": "bg-amber-50",
  "🍗": "bg-orange-50",
  "🥩": "bg-red-50",
  "🐟": "bg-blue-50",
};

export function FoodCard({ food }: { food: Food }) {
  return (
    <Link
      href={`/food/${food.id}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200 flex flex-col"
    >
      <div className={cn("relative flex items-center justify-center h-36", emojiColors[food.emoji] || "bg-gray-50")}>
        <span className="text-5xl">{food.emoji}</span>
        <button
          className="absolute bottom-2 right-2 w-7 h-7 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center text-lg font-bold transition-colors"
          onClick={(e) => { e.preventDefault(); }}
        >
          +
        </button>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="font-bold text-sm text-gray-900 mb-0.5 truncate">{food.name}</p>
        <p className="text-xs text-gray-400 mb-2 truncate">{food.restaurant}</p>
        <div className="flex items-center gap-1 mb-2">
          <Stars rating={food.rating} size={11} />
          <span className="text-xs text-gray-400">({food.reviews})</span>
        </div>
        <p className="text-sm font-extrabold text-green-600 mt-auto">${food.price}.00</p>
      </div>
    </Link>
  );
}

// ─── CategoryTabs ──────────────────────────────────────────────
export function CategoryTabs({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (cat: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
      {CATEGORIES.map((c) => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap border transition-all",
            active === c
              ? "bg-orange-500 border-orange-500 text-white"
              : "bg-white border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500"
          )}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────
export function Navbar() {
  const pathname = usePathname();
  const links = [
    { label: "Home", href: "/" },
    { label: "Menu", href: "/menu" },
    { label: "Restaurants", href: "/restaurants" },
    { label: "Offers", href: "/offers" },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-xl font-extrabold font-[Poppins]">
            <span className="text-green-600">F</span>
            <span className="text-orange-500">o</span>
            <span className="text-green-600">o</span>
            <span className="text-orange-500">d</span>
            <span className="text-green-600">y</span>
          </span>
        </Link>

        {/* Nav links */}
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

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="text-gray-500 hover:text-gray-800 transition-colors">
            <Search size={18} />
          </button>
          <button className="relative text-gray-500 hover:text-gray-800 transition-colors">
            <ShoppingCart size={18} />
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── Footer ───────────────────────────────────────────────────
export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <div className="text-2xl font-extrabold font-[Poppins] mb-3">
            <span className="text-green-400">F</span>
            <span className="text-orange-400">o</span>
            <span className="text-green-400">o</span>
            <span className="text-orange-400">d</span>
            <span className="text-green-400">y</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-4 max-w-xs">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepturi nisi excepturi tempor molestiae.
          </p>
          <div className="flex gap-2">
            {["📘", "🐦", "📷", "💼"].map((icon, i) => (
              <button
                key={i}
                className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-sm transition-colors"
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
        {[
          { title: "Menu", items: ["Categories", "How it works", "Popular", "Newest"] },
          { title: "Services", items: ["Free Centres", "Feedback", "Other", "Payment & Tax"] },
          { title: "Support", items: ["Help Centre", "FAQ", "Documents"] },
          { title: "Company", items: ["About Us", "Blog", "Careers", "News"] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-bold text-green-400 mb-3">{col.title}</h4>
            {col.items.map((item) => (
              <p key={item} className="text-xs text-gray-400 mb-2 hover:text-gray-200 cursor-pointer transition-colors">
                {item}
              </p>
            ))}
          </div>
        ))}
      </div>
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-5 py-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-500">© 2024 Foody Inc. All Rights Reserved</p>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
