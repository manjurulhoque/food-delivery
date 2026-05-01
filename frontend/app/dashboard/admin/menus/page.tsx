"use client";

import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/dashboard-shell";
import { adminSidebarMenus } from "@/components/admin-sidebar-menus";
import {
    AvailableMenu,
    useCreateMenuMutation,
    useDeleteMenuMutation,
    useGetAvailableMenusQuery,
    useGetMenuCategoriesQuery,
    useGetRestaurantsQuery,
    useUpdateMenuMutation,
} from "@/lib/services/restaurant-api";

type MenuForm = {
    restaurantId: number;
    name: string;
    price: string;
    categoryId: number | null;
    imageFile: File | null;
};

const initialForm: MenuForm = {
    restaurantId: 0,
    name: "",
    price: "",
    categoryId: null,
    imageFile: null,
};

export default function AdminMenusPage() {
    const { data: session } = useSession();
    const { data: menusData, isLoading, isError } = useGetAvailableMenusQuery({ page_size: 100 });
    const { data: restaurantsData } = useGetRestaurantsQuery();
    const { data: categoriesData } = useGetMenuCategoriesQuery();
    const [createMenu, { isLoading: isCreating }] = useCreateMenuMutation();
    const [updateMenu, { isLoading: isUpdating }] = useUpdateMenuMutation();
    const [deleteMenu, { isLoading: isDeleting }] = useDeleteMenuMutation();
    const [form, setForm] = useState<MenuForm>(initialForm);
    const [editing, setEditing] = useState<AvailableMenu | null>(null);
    const [error, setError] = useState("");

    const menus = menusData?.data ?? [];
    const restaurants = restaurantsData?.data ?? [];
    const categories = categoriesData?.data ?? [];

    const onCreate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!form.restaurantId) return;
        setError("");

        try {
            await createMenu({
                restaurantId: form.restaurantId,
                name: form.name,
                price: Number(form.price),
                category: form.categoryId,
                image: form.imageFile,
                accessToken: session?.accessToken,
            }).unwrap();
            setForm(initialForm);
        } catch (createError) {
            setError(createError instanceof Error ? createError.message : "Failed to create menu");
        }
    };

    const onUpdate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editing) return;
        setError("");

        try {
            await updateMenu({
                restaurantId: form.restaurantId,
                menuId: editing.id,
                name: form.name,
                price: Number(form.price),
                category: form.categoryId,
                image: form.imageFile,
                accessToken: session?.accessToken,
            }).unwrap();
            setEditing(null);
            setForm(initialForm);
        } catch (updateError) {
            setError(updateError instanceof Error ? updateError.message : "Failed to update menu");
        }
    };

    const onDelete = async (menu: AvailableMenu) => {
        setError("");
        try {
            await deleteMenu({
                restaurantId: menu.restaurant.id,
                menuId: menu.id,
                accessToken: session?.accessToken,
            }).unwrap();
        } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : "Failed to delete menu");
        }
    };

    return (
        <DashboardShell
            roleTitle="Admin - Menus"
            subtitle="Create, update, and delete restaurant menu items with category assignments."
            sidebarMenus={adminSidebarMenus}
            stats={[
                { label: "Total Menus", value: String(menus.length) },
                { label: "Create Pending", value: isCreating ? "Yes" : "No" },
                { label: "Update Pending", value: isUpdating ? "Yes" : "No" },
                { label: "Delete Pending", value: isDeleting ? "Yes" : "No" },
            ]}
            cards={[
                {
                    title: "Menu Operations",
                    description: "Keep menus fresh, categorized, and correctly priced.",
                    action: "Review Menus",
                },
            ]}
        >
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
                <h3 className="font-[Poppins] font-bold text-lg text-gray-900 mb-3">{editing ? "Edit Menu" : "Create Menu"}</h3>
                <form className="grid md:grid-cols-4 gap-2" onSubmit={editing ? onUpdate : onCreate}>
                    <select
                        value={form.restaurantId}
                        onChange={(event) => setForm((prev) => ({ ...prev, restaurantId: Number(event.target.value) }))}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
                        required
                    >
                        <option value={0}>Select restaurant</option>
                        {restaurants.map((restaurant) => (
                            <option key={restaurant.id} value={restaurant.id}>
                                {restaurant.name}
                            </option>
                        ))}
                    </select>
                    <input
                        value={form.name}
                        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                        placeholder="Menu name"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
                        required
                    />
                    <input
                        type="number"
                        value={form.price}
                        onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                        placeholder="Price"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
                        required
                    />
                    <select
                        value={form.categoryId ?? ""}
                        onChange={(event) =>
                            setForm((prev) => ({
                                ...prev,
                                categoryId: event.target.value ? Number(event.target.value) : null,
                            }))
                        }
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
                    >
                        <option value="">No category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <div className="md:col-span-4 flex gap-2">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    imageFile: event.target.files?.[0] ?? null,
                                }))
                            }
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
                        />
                        <button
                            type="submit"
                            disabled={isCreating || isUpdating}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
                        >
                            {editing ? (isUpdating ? "Updating..." : "Update") : isCreating ? "Creating..." : "Create"}
                        </button>
                        {editing && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditing(null);
                                    setForm(initialForm);
                                }}
                                className="text-sm font-bold px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-[Poppins] font-bold text-lg text-gray-900 mb-3">All Menus</h3>
                {isLoading && <p className="text-sm text-gray-500">Loading menus...</p>}
                {isError && <p className="text-sm text-red-500">Failed to load menus.</p>}
                {!isLoading && !isError && (
                    <div className="space-y-2">
                        {menus.map((menu) => (
                            <div key={menu.id} className="border border-gray-100 rounded-xl p-3 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">
                                        {menu.name} - ${menu.price}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {menu.restaurant.name} | {menu.category?.name ?? "Uncategorized"}
                                    </p>
                                    {menu.image && (
                                        <p className="text-xs text-gray-400">
                                            Image: {menu.image}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditing(menu);
                                            setForm({
                                                restaurantId: menu.restaurant.id,
                                                name: menu.name,
                                                price: String(menu.price),
                                                categoryId: menu.category?.id ?? null,
                                                imageFile: null,
                                            });
                                        }}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-700"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onDelete(menu)}
                                        className="text-xs font-bold text-red-600 hover:text-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
            </div>
        </DashboardShell>
    );
}
