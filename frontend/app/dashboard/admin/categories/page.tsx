"use client";

import { FormEvent, useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { adminSidebarMenus } from "@/components/admin-sidebar-menus";
import {
    useCreateMenuCategoryMutation,
    useDeleteMenuCategoryMutation,
    useGetMenuCategoriesQuery,
    useUpdateMenuCategoryMutation,
} from "@/lib/services/restaurant-api";

export default function AdminCategoriesPage() {
    const { data, isLoading, isError } = useGetMenuCategoriesQuery();
    const [createCategory, { isLoading: isCreating }] = useCreateMenuCategoryMutation();
    const [updateCategory, { isLoading: isUpdating }] = useUpdateMenuCategoryMutation();
    const [deleteCategory, { isLoading: isDeleting }] = useDeleteMenuCategoryMutation();
    const [name, setName] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");
    const [error, setError] = useState("");

    const categories = useMemo(() => data?.data ?? [], [data]);
    const categoryCount = categories.length;

    const sortedCategories = useMemo(
        () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
        [categories]
    );

    const onCreate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        if (!name.trim()) return;

        try {
            await createCategory({ name: name.trim() }).unwrap();
            setName("");
        } catch (createError) {
            setError(createError instanceof Error ? createError.message : "Failed to create category");
        }
    };

    const onUpdate = async (categoryId: number) => {
        setError("");
        if (!editingName.trim()) return;

        try {
            await updateCategory({ categoryId, name: editingName.trim() }).unwrap();
            setEditingId(null);
            setEditingName("");
        } catch (updateError) {
            setError(updateError instanceof Error ? updateError.message : "Failed to update category");
        }
    };

    const onDelete = async (categoryId: number) => {
        setError("");
        try {
            await deleteCategory({ categoryId }).unwrap();
        } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : "Failed to delete category");
        }
    };

    return (
        <DashboardShell
            roleTitle="Admin - Menu Categories"
            subtitle="Create, rename, and remove menu categories used across restaurant menus."
            sidebarMenus={adminSidebarMenus}
            stats={[
                { label: "Total Categories", value: String(categoryCount) },
                { label: "Create Pending", value: isCreating ? "Yes" : "No" },
                { label: "Update Pending", value: isUpdating ? "Yes" : "No" },
                { label: "Delete Pending", value: isDeleting ? "Yes" : "No" },
            ]}
            cards={[
                {
                    title: "Category Governance",
                    description: "Keep category names clean and consistent across all restaurants.",
                    action: "Review Naming",
                },
            ]}
        >
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
                <h3 className="font-[Poppins] font-bold text-lg text-gray-900 mb-3">Create Category</h3>
                <form className="flex gap-2" onSubmit={onCreate}>
                    <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Category name"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
                    />
                    <button
                        type="submit"
                        disabled={isCreating}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
                    >
                        {isCreating ? "Creating..." : "Create"}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-[Poppins] font-bold text-lg text-gray-900 mb-3">All Categories</h3>
                {isLoading && <p className="text-sm text-gray-500">Loading categories...</p>}
                {isError && <p className="text-sm text-red-500">Failed to load categories.</p>}
                {!isLoading && !isError && (
                    <div className="space-y-2">
                        {sortedCategories.map((category) => (
                            <div key={category.id} className="border border-gray-100 rounded-xl p-3 flex items-center gap-2">
                                {editingId === category.id ? (
                                    <input
                                        value={editingName}
                                        onChange={(event) => setEditingName(event.target.value)}
                                        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-green-400"
                                    />
                                ) : (
                                    <p className="flex-1 text-sm font-semibold text-gray-700">{category.name}</p>
                                )}

                                {editingId === category.id ? (
                                    <>
                                        <button
                                            onClick={() => onUpdate(category.id)}
                                            className="text-xs font-bold text-green-600 hover:text-green-700"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingId(null);
                                                setEditingName("");
                                            }}
                                            className="text-xs font-bold text-gray-500 hover:text-gray-700"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => {
                                                setEditingId(category.id);
                                                setEditingName(category.name);
                                            }}
                                            className="text-xs font-bold text-blue-600 hover:text-blue-700"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => onDelete(category.id)}
                                            className="text-xs font-bold text-red-600 hover:text-red-700"
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
            </div>
        </DashboardShell>
    );
}
