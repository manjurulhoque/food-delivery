"use client";

import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { Food } from "@/lib/data";
import { FoodCard } from "@/components/food-card";
import { CategoryTabs } from "@/components/category-tabs";
import {
    useGetAvailableMenusQuery,
    useGetMenuCategoriesQuery,
} from "@/lib/services/restaurant-api";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 9;
const MENU_EMOJIS = ["🍕", "🍝", "🍗", "🥩", "🐟"];

export default function MenuPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [sortBy, setSortBy] = useState("popular");
    const [maxPrice, setMaxPrice] = useState<number | null>(null);
    const [selectedRests, setSelectedRests] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = useGetAvailableMenusQuery();
    const { data: categoriesData } = useGetMenuCategoriesQuery();

    const menus = useMemo<Food[]>(() => {
        const menus = data?.data ?? [];
        return menus.map((menu) => ({
            id: menu.id,
            name: menu.name,
            category: menu.category?.name ?? "Uncategorized",
            price: Math.round(menu.price),
            emoji: MENU_EMOJIS[menu.id % MENU_EMOJIS.length],
            restaurant: menu.restaurant.name,
            rating: 4.5,
            reviews: 100 + menu.id,
            deliveryTime: "20-35",
            description: menu.name,
            ingredients: [],
            location: menu.restaurant.address,
        }));
    }, [data]);

    const restaurants = useMemo(
        () => Array.from(new Set((data?.data ?? []).map((menu) => menu.restaurant.name))),
        [data]
    );
    const categories = useMemo(
        () => categoriesData?.data?.map((category) => category.name) ?? [],
        [categoriesData]
    );
    const tabCategories = useMemo(() => ["All", ...categories], [categories]);

    const maxAvailablePrice = useMemo(
        () => Math.max(...menus.map((menu) => menu.price), 200),
        [menus]
    );

    const toggleItem = (arr: string[], item: string, setArr: (v: string[]) => void) => {
        setArr(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
    };

    const filteredMenus = useMemo(() => {
        let result = menus;
        if (maxPrice !== null) {
            result = result.filter((menu) => menu.price <= maxPrice);
        }
        if (activeCategory !== "All")
            result = result.filter((f) => f.category === activeCategory);
        if (selectedRests.length)
            result = result.filter((f) => selectedRests.some((r) => f.restaurant.includes(r)));
        if (selectedCategories.length)
            result = result.filter((f) => selectedCategories.includes(f.category));
        result.sort((a, b) => {
            if (sortBy === "popular") return b.reviews - a.reviews;
            if (sortBy === "newest") return b.id - a.id;
            if (sortBy === "fastest") return a.deliveryTime.localeCompare(b.deliveryTime);
            return a.price - b.price;
        });
        return result;
    }, [menus, activeCategory, sortBy, maxPrice, selectedRests, selectedCategories]);

    const totalPages = Math.ceil(filteredMenus.length / ITEMS_PER_PAGE);
    const paginatedMenus = filteredMenus.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const allApplied = [
        ...selectedCategories.map((category) => ({
            label: category,
            onRemove: () => toggleItem(selectedCategories, category, setSelectedCategories),
        })),
        ...selectedRests.map((r) => ({ label: r, onRemove: () => toggleItem(selectedRests, r, setSelectedRests) })),
    ];

    return (
        <main className="max-w-6xl mx-auto px-5 py-6">
            <div className="mb-5">
                <CategoryTabs
                    active={activeCategory}
                    onSelect={(category) => {
                        setActiveCategory(category);
                        setPage(1);
                    }}
                    categories={tabCategories}
                />
            </div>
            <div className="flex gap-5">
                {/* ─── Sidebar ─────────────────── */}
                <aside className="w-52 shrink-0 flex flex-col gap-3">
                    {/* Applied Filters */}
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                        <h4 className="text-xs font-extrabold text-green-600 mb-3">Applied Filters</h4>
                        <div className="flex flex-wrap gap-1.5">
                            {allApplied.map((f, i) => (
                                <span
                                    key={i}
                                    className="flex items-center gap-1 bg-orange-50 text-orange-600 text-[11px] font-bold px-2 py-0.5 rounded-full"
                                >
                                    {f.label}
                                    {f.onRemove && (
                                        <button onClick={f.onRemove} className="text-orange-400 hover:text-orange-700 font-black text-xs">
                                            ×
                                        </button>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Sort By */}
                    <SidebarSection title="Sort By">
                        {[
                            { value: "popular", label: "Popular" },
                            { value: "newest", label: "Newest" },
                            { value: "fastest", label: "Fastest" },
                            { value: "price", label: "Price (low)" },
                        ].map(({ value, label }) => (
                            <label
                                key={value}
                                className={cn(
                                    "flex items-center gap-2 text-xs cursor-pointer mb-1.5",
                                    sortBy === value ? "text-green-600 font-bold" : "text-gray-500"
                                )}
                            >
                                <input
                                    type="radio"
                                    checked={sortBy === value}
                                    onChange={() => setSortBy(value)}
                                    className="accent-green-600"
                                />
                                {label}
                            </label>
                        ))}
                    </SidebarSection>

                    {/* Price Range */}
                    <SidebarSection title="Filter by Price">
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                            <span>Low</span><span>High</span>
                        </div>
                        <input
                            type="range" min={0} max={maxAvailablePrice} value={maxPrice ?? maxAvailablePrice}
                            onChange={(e) => { setMaxPrice(+e.target.value); setPage(1); }}
                            className="w-full accent-green-600"
                        />
                        <div className="flex justify-between text-xs font-bold text-green-600 mt-1">
                            <span>$0</span><span>${maxPrice ?? maxAvailablePrice}</span>
                        </div>
                    </SidebarSection>

                    {/* Categories */}
                    <SidebarSection title="Categories">
                        {categories.map((category) => (
                            <label
                                key={category}
                                className={cn(
                                    "flex items-center gap-2 text-xs cursor-pointer mb-1.5",
                                    selectedCategories.includes(category) ? "text-green-600 font-bold" : "text-gray-500"
                                )}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(category)}
                                    onChange={() => { toggleItem(selectedCategories, category, setSelectedCategories); setPage(1); }}
                                    className="accent-green-600"
                                />
                                <span className="truncate">{category}</span>
                            </label>
                        ))}
                    </SidebarSection>

                    {/* Restaurants */}
                    <SidebarSection title="Restaurants">
                        {restaurants.map((r) => (
                            <label
                                key={r}
                                className={cn(
                                    "flex items-center gap-2 text-xs cursor-pointer mb-1.5",
                                    selectedRests.includes(r) ? "text-green-600 font-bold" : "text-gray-500"
                                )}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedRests.includes(r)}
                                    onChange={() => { toggleItem(selectedRests, r, setSelectedRests); setPage(1); }}
                                    className="accent-green-600"
                                />
                                <span className="truncate">{r}</span>
                            </label>
                        ))}
                    </SidebarSection>
                </aside>

                {/* ─── Food Grid ─────────────────── */}
                <div className="flex-1 min-w-0">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <span className="text-5xl mb-3">⏳</span>
                            <p className="font-semibold">Loading menus...</p>
                        </div>
                    )}
                    {isError && (
                        <div className="flex flex-col items-center justify-center py-20 text-red-500">
                            <span className="text-5xl mb-3">⚠️</span>
                            <p className="font-semibold">Failed to load menus</p>
                        </div>
                    )}
                    {paginatedMenus.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                            {paginatedMenus.map((menu) => (
                                <FoodCard key={menu.id} food={menu} />
                            ))}
                        </div>
                    )}
                    {paginatedMenus.length === 0 && !isLoading && !isError && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <span className="text-5xl mb-3">🍽️</span>
                            <p className="font-semibold">No menus found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && !isLoading && !isError && (
                        <div className="flex justify-center gap-1.5">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={cn(
                                        "w-8 h-8 rounded-lg text-xs font-bold border transition-all",
                                        page === p
                                            ? "bg-green-600 border-green-600 text-white"
                                            : "bg-white border-gray-200 text-gray-400 hover:border-green-400"
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                            {totalPages > 5 && (
                                <>
                                    <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-xs">…</span>
                                    <button
                                        onClick={() => setPage(totalPages)}
                                        className={cn(
                                            "w-8 h-8 rounded-lg text-xs font-bold border transition-all",
                                            page === totalPages
                                                ? "bg-green-600 border-green-600 text-white"
                                                : "bg-white border-gray-200 text-gray-400 hover:border-green-400"
                                        )}
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ─── CTA Banner ─────────────────── */}
            <div className="mt-10 bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-center gap-6">
                <div className="flex-1">
                    <h3 className="font-[Poppins] font-bold text-lg mb-1">Want To Earn Extra? Join As a Delivery Man</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat tempor incididunt ut labore
                        et dolore magna.
                    </p>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-6 py-2 rounded-lg transition-colors">
                        Apply Now
                    </button>
                </div>
                <div className="text-6xl select-none hidden md:block">🚴</div>
            </div>
        </main>
    );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(true);
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between mb-2"
            >
                <h4 className="text-xs font-extrabold text-gray-800">{title}</h4>
                <ChevronDown
                    size={14}
                    className={cn("text-gray-400 transition-transform", open && "rotate-180")}
                />
            </button>
            {open && <div>{children}</div>}
        </div>
    );
}
