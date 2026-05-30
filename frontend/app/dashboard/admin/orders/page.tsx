"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/dashboard-shell";
import { adminSidebarMenus } from "@/components/admin-sidebar-menus";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
    ORDER_STATUSES,
    type AdminOrder,
    useAdminUpdateOrderMutation,
    useGetAdminOrdersQuery,
} from "@/lib/services/order-api";
import { useGetRestaurantsQuery } from "@/lib/services/restaurant-api";

function statusBadgeClass(status: string) {
    switch (status) {
        case "PENDING":
            return "bg-amber-50 text-amber-800 border-amber-200";
        case "PAID":
            return "bg-emerald-50 text-emerald-800 border-emerald-200";
        case "CONFIRMED":
            return "bg-sky-50 text-sky-800 border-sky-200";
        case "PREPARING":
            return "bg-violet-50 text-violet-800 border-violet-200";
        case "DELIVERED":
            return "bg-green-50 text-green-800 border-green-200";
        case "CANCELED":
            return "bg-red-50 text-red-800 border-red-200";
        case "REFUNDED":
            return "bg-gray-50 text-gray-700 border-gray-200";
        default:
            return "bg-gray-50 text-gray-700 border-gray-200";
    }
}

function OrderRow({
    order,
    restaurantName,
    onStatusChange,
    isUpdating,
}: {
    order: AdminOrder;
    restaurantName: string;
    onStatusChange: (orderId: number, status: string) => void;
    isUpdating: boolean;
}) {
    return (
        <tr className="border-b border-gray-100 last:border-0">
            <td className="px-3 py-3 text-sm font-semibold text-gray-900">#{order.id}</td>
            <td className="px-3 py-3 text-sm text-gray-600">User {order.user_id}</td>
            <td className="px-3 py-3 text-sm text-gray-600">{restaurantName}</td>
            <td className="px-3 py-3 text-sm text-gray-600">
                ${Number(order.total_price).toFixed(2)}
            </td>
            <td className="px-3 py-3">
                <span
                    className={cn(
                        "inline-flex rounded-full border px-2.5 py-1 text-xs font-bold",
                        statusBadgeClass(order.status)
                    )}
                >
                    {order.status.replace(/_/g, " ")}
                </span>
            </td>
            <td className="px-3 py-3 text-xs text-gray-500">
                {new Date(order.created_at).toLocaleString(undefined, {
                    dateStyle: "short",
                    timeStyle: "short",
                })}
            </td>
            <td className="px-3 py-3">
                <select
                    value={order.status}
                    disabled={isUpdating}
                    onChange={(event) => onStatusChange(order.id, event.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-green-400 disabled:opacity-60"
                >
                    {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                            {status.replace(/_/g, " ")}
                        </option>
                    ))}
                </select>
            </td>
        </tr>
    );
}

export default function AdminOrdersPage() {
    const { data: session, status: authStatus } = useSession();
    const isSuperuser = Boolean(session?.user?.is_superuser);
    const isAuthed = authStatus === "authenticated";

    const { data, isLoading, isError, isFetching } = useGetAdminOrdersQuery(undefined, {
        skip: !isAuthed || !isSuperuser,
    });
    const { data: restaurantsData } = useGetRestaurantsQuery(undefined, {
        skip: !isAuthed || !isSuperuser,
    });
    const [adminUpdateOrder, { isLoading: isUpdating }] = useAdminUpdateOrderMutation();
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

    const restaurantNames = useMemo(() => {
        const map = new Map<number, string>();
        restaurantsData?.data?.forEach((r) => map.set(r.id, r.name));
        return map;
    }, [restaurantsData]);

    const orders = data?.orders ?? [];

    const filteredOrders = useMemo(() => {
        if (statusFilter === "ALL") return orders;
        return orders.filter((order) => order.status === statusFilter);
    }, [orders, statusFilter]);

    const statusCounts = useMemo(() => {
        const counts = new Map<string, number>();
        for (const order of orders) {
            counts.set(order.status, (counts.get(order.status) ?? 0) + 1);
        }
        return counts;
    }, [orders]);

    const handleStatusChange = async (orderId: number, status: string) => {
        setUpdatingOrderId(orderId);
        try {
            await adminUpdateOrder({ orderId, status }).unwrap();
            toast({
                title: "Order updated",
                description: `Order #${orderId} is now ${status.replace(/_/g, " ")}.`,
            });
        } catch {
            toast({
                title: "Update failed",
                description: "Could not update order status. Check your admin permissions.",
                variant: "destructive",
            });
        } finally {
            setUpdatingOrderId(null);
        }
    };

    return (
        <DashboardShell
            roleTitle="Admin - Orders"
            subtitle="Monitor all platform orders, review statuses, and take action when needed."
            sidebarMenus={adminSidebarMenus}
            stats={[
                { label: "Total Orders", value: String(orders.length) },
                { label: "Pending", value: String(statusCounts.get("PENDING") ?? 0) },
                { label: "Paid", value: String(statusCounts.get("PAID") ?? 0) },
                { label: "Delivered", value: String(statusCounts.get("DELIVERED") ?? 0) },
            ]}
            cards={[]}
        >
            {!isAuthed ? (
                <div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-5 py-6 text-sm text-amber-900">
                    <p className="font-semibold">Sign in as admin</p>
                    <Link
                        href="/login?callbackUrl=%2Fdashboard%2Fadmin%2Forders"
                        className="mt-4 inline-flex text-xs font-bold text-green-700 underline underline-offset-2"
                    >
                        Go to login
                    </Link>
                </div>
            ) : !isSuperuser ? (
                <div className="rounded-2xl border border-gray-100 bg-white px-5 py-6 text-sm text-gray-700">
                    <p className="font-semibold text-gray-900">Admin access required</p>
                    <p className="mt-1">Sign in with a superuser account to manage orders.</p>
                </div>
            ) : isLoading ? (
                <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6">
                    <div className="h-5 w-48 rounded bg-gray-100" />
                    <div className="mt-4 space-y-3">
                        <div className="h-10 rounded bg-gray-100" />
                        <div className="h-10 rounded bg-gray-100" />
                        <div className="h-10 rounded bg-gray-100" />
                    </div>
                </div>
            ) : isError ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-6 text-sm text-red-900">
                    <p className="font-semibold">Could not load orders</p>
                    <p className="mt-1">Ensure order-service is running and you are logged in as admin.</p>
                </div>
            ) : (
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-[Poppins] text-lg font-bold text-gray-900">All Orders</h3>
                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-green-400"
                        >
                            <option value="ALL">All statuses</option>
                            {ORDER_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                    {status.replace(/_/g, " ")} ({statusCounts.get(status) ?? 0})
                                </option>
                            ))}
                        </select>
                    </div>

                    {filteredOrders.length === 0 ? (
                        <p className="text-sm text-gray-500">No orders match this filter.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wide text-gray-500">
                                        <th className="px-3 py-2">Order</th>
                                        <th className="px-3 py-2">Customer</th>
                                        <th className="px-3 py-2">Restaurant</th>
                                        <th className="px-3 py-2">Total</th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2">Placed</th>
                                        <th className="px-3 py-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order) => (
                                        <OrderRow
                                            key={order.id}
                                            order={order}
                                            restaurantName={
                                                restaurantNames.get(order.restaurant_id) ??
                                                `Restaurant #${order.restaurant_id}`
                                            }
                                            onStatusChange={handleStatusChange}
                                            isUpdating={
                                                isUpdating && updatingOrderId === order.id
                                            }
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {isFetching ? (
                        <p className="mt-3 text-center text-xs text-gray-400">Updating…</p>
                    ) : null}
                </div>
            )}
        </DashboardShell>
    );
}
