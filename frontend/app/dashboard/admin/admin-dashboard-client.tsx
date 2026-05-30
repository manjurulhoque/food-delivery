"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/dashboard-shell";
import { adminSidebarMenus } from "@/components/admin-sidebar-menus";
import { useGetAdminOrdersQuery } from "@/lib/services/order-api";
import { useGetRestaurantsQuery } from "@/lib/services/restaurant-api";

export default function AdminDashboardClient() {
    const { data: session, status: authStatus } = useSession();
    const isSuperuser = Boolean(session?.user?.is_superuser);
    const isAuthed = authStatus === "authenticated";

    const { data: ordersData } = useGetAdminOrdersQuery(undefined, {
        skip: !isAuthed || !isSuperuser,
    });
    const { data: restaurantsData } = useGetRestaurantsQuery(undefined, {
        skip: !isAuthed || !isSuperuser,
    });

    const orders = ordersData?.orders ?? [];
    const restaurants = restaurantsData?.data ?? [];

    const openOrders = useMemo(
        () =>
            orders.filter((o) =>
                ["PENDING", "PAID", "CONFIRMED", "PREPARING"].includes(o.status)
            ).length,
        [orders]
    );

    return (
        <DashboardShell
            roleTitle="Admin Dashboard"
            subtitle="Oversee platform activity, service health, and moderation across all user roles."
            sidebarMenus={adminSidebarMenus}
            stats={[
                { label: "Total Orders", value: isSuperuser ? String(orders.length) : "—" },
                { label: "Open Orders", value: isSuperuser ? String(openOrders) : "—" },
                { label: "Restaurants", value: isSuperuser ? String(restaurants.length) : "—" },
                { label: "Delivered", value: isSuperuser ? String(orders.filter((o) => o.status === "DELIVERED").length) : "—" },
            ]}
            cards={[
                {
                    title: "Orders Monitor",
                    description: "View all orders with live status and update them when operations need a hand.",
                    action: "View Orders",
                },
                {
                    title: "Restaurant Management",
                    description: "Create, edit, and remove restaurants on the platform.",
                    action: "Manage Restaurants",
                },
                {
                    title: "Menu Catalog",
                    description: "Maintain menus and categories across partner restaurants.",
                    action: "Manage Menus",
                },
            ]}
        >
            {isSuperuser ? (
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="font-[Poppins] text-lg font-bold text-gray-900">
                                Recent orders
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Latest platform orders — open the monitor for full controls.
                            </p>
                        </div>
                        <Link
                            href="/dashboard/admin/orders"
                            className="inline-flex rounded-full bg-green-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-green-700"
                        >
                            Open orders monitor
                        </Link>
                    </div>
                    {orders.length === 0 ? (
                        <p className="mt-4 text-sm text-gray-500">No orders yet.</p>
                    ) : (
                        <div className="mt-4 space-y-2">
                            {orders.slice(0, 5).map((order) => (
                                <div
                                    key={order.id}
                                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-100 px-3 py-2.5"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            Order #{order.id}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            User {order.user_id} · ${Number(order.total_price).toFixed(2)}
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-bold text-gray-700">
                                        {order.status.replace(/_/g, " ")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : null}
        </DashboardShell>
    );
}
