"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/dashboard-shell";
import { adminSidebarMenus } from "@/components/admin-sidebar-menus";
import {
    Restaurant,
    useCreateRestaurantMutation,
    useDeleteRestaurantMutation,
    useGetRestaurantsQuery,
    useUpdateRestaurantMutation,
} from "@/lib/services/restaurant-api";

type RestaurantFormState = {
    name: string;
    address: string;
    phone: string;
};

const initialForm: RestaurantFormState = {
    name: "",
    address: "",
    phone: "",
};

export default function AdminRestaurantsPage() {
    const { data: session } = useSession();
    const { data, isLoading, isError } = useGetRestaurantsQuery();
    const [createRestaurant, { isLoading: isCreating }] = useCreateRestaurantMutation();
    const [updateRestaurant, { isLoading: isUpdating }] = useUpdateRestaurantMutation();
    const [deleteRestaurant, { isLoading: isDeleting }] = useDeleteRestaurantMutation();
    const [form, setForm] = useState<RestaurantFormState>(initialForm);
    const [editing, setEditing] = useState<Restaurant | null>(null);
    const [error, setError] = useState("");

    const restaurants = useMemo(() => data?.data ?? [], [data]);
    const sortedRestaurants = useMemo(
        () => [...restaurants].sort((a, b) => a.name.localeCompare(b.name)),
        [restaurants]
    );

    const onCreate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        try {
            await createRestaurant({
                accessToken: session?.accessToken,
                ...form,
            }).unwrap();
            setForm(initialForm);
        } catch (createError) {
            setError(createError instanceof Error ? createError.message : "Failed to create restaurant");
        }
    };

    const onUpdate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editing) return;
        setError("");
        try {
            await updateRestaurant({
                restaurantId: editing.id,
                user_id: editing.user_id,
                accessToken: session?.accessToken,
                ...form,
            }).unwrap();
            setEditing(null);
            setForm(initialForm);
        } catch (updateError) {
            setError(updateError instanceof Error ? updateError.message : "Failed to update restaurant");
        }
    };

    const onDelete = async (restaurantId: number) => {
        setError("");
        try {
            await deleteRestaurant({ restaurantId, accessToken: session?.accessToken }).unwrap();
        } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : "Failed to delete restaurant");
        }
    };

    return (
        <DashboardShell
            roleTitle="Admin - Restaurants"
            subtitle="Create, update, and remove restaurants from the delivery network."
            sidebarMenus={adminSidebarMenus}
            stats={[
                { label: "Total Restaurants", value: String(restaurants.length) },
                { label: "Create Pending", value: isCreating ? "Yes" : "No" },
                { label: "Update Pending", value: isUpdating ? "Yes" : "No" },
                { label: "Delete Pending", value: isDeleting ? "Yes" : "No" },
            ]}
            cards={[
                {
                    title: "Restaurant Operations",
                    description: "Manage onboarding and maintain accurate restaurant information.",
                    action: "Review Profiles",
                },
            ]}
        >
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
                <h3 className="font-[Poppins] font-bold text-lg text-gray-900 mb-3">
                    {editing ? "Edit Restaurant" : "Create Restaurant"}
                </h3>
                <form className="grid md:grid-cols-3 gap-2" onSubmit={editing ? onUpdate : onCreate}>
                    <input
                        value={form.name}
                        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                        placeholder="Restaurant name"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
                        required
                    />
                    <input
                        value={form.address}
                        onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                        placeholder="Address"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
                        required
                    />
                    <input
                        value={form.phone}
                        onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                        placeholder="Phone"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
                        required
                    />
                    <div className="md:col-span-3 flex gap-2">
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
                <h3 className="font-[Poppins] font-bold text-lg text-gray-900 mb-3">All Restaurants</h3>
                {isLoading && <p className="text-sm text-gray-500">Loading restaurants...</p>}
                {isError && <p className="text-sm text-red-500">Failed to load restaurants.</p>}
                {!isLoading && !isError && (
                    <div className="space-y-2">
                        {sortedRestaurants.map((restaurant) => (
                            <div key={restaurant.id} className="border border-gray-100 rounded-xl p-3 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">{restaurant.name}</p>
                                    <p className="text-xs text-gray-500">{restaurant.address} | {restaurant.phone}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditing(restaurant);
                                            setForm({
                                                name: restaurant.name,
                                                address: restaurant.address,
                                                phone: restaurant.phone,
                                            });
                                        }}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-700"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onDelete(restaurant.id)}
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
