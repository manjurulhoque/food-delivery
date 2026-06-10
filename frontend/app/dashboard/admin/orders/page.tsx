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
import {
    useAssignDriverToOrderMutation,
    useGetDeliveriesQuery,
    useGetDriverProfilesQuery,
} from "@/lib/services/delivery-api";
import type { Delivery } from "@/lib/types/delivery";
import type { DriverProfile } from "@/lib/types/driver";
import { useGetRestaurantsQuery } from "@/lib/services/restaurant-api";

const ASSIGNABLE_ORDER_STATUSES = new Set(["PAID", "CONFIRMED", "PREPARING"]);

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

function driverLabel(driver: DriverProfile) {
    const name = driver.email ?? `Driver #${driver.userId}`;
    const flags = [
        driver.isOnline ? "online" : "offline",
        driver.vehicleType ?? undefined,
    ]
        .filter(Boolean)
        .join(" · ");
    return `${name} (${flags})`;
}

function OrderRow({
    order,
    restaurantName,
    delivery,
    drivers,
    selectedDriverId,
    onDriverSelect,
    onStatusChange,
    onAssignDriver,
    isUpdatingStatus,
    isAssigning,
}: {
    order: AdminOrder;
    restaurantName: string;
    delivery?: Delivery;
    drivers: DriverProfile[];
    selectedDriverId: number | "";
    onDriverSelect: (orderId: number, driverId: number) => void;
    onStatusChange: (orderId: number, status: string) => void;
    onAssignDriver: (orderId: number, driverId: number) => void;
    isUpdatingStatus: boolean;
    isAssigning: boolean;
}) {
    const canAssign = ASSIGNABLE_ORDER_STATUSES.has(order.status);
    const assignedDriver = delivery?.driverId
        ? drivers.find((d) => d.userId === delivery.driverId)
        : undefined;

    return (
        <tr className="border-b border-gray-100 last:border-0 align-top">
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
                {canAssign ? (
                    <div className="min-w-[220px] space-y-2">
                        {assignedDriver ? (
                            <p className="text-xs text-gray-600">
                                Assigned:{" "}
                                <span className="font-semibold text-gray-800">
                                    {assignedDriver.email ?? `Driver #${assignedDriver.userId}`}
                                </span>
                                {delivery?.status ? (
                                    <span className="ml-1 text-gray-400">
                                        · {delivery.status.replace(/_/g, " ")}
                                    </span>
                                ) : null}
                            </p>
                        ) : (
                            <p className="text-xs text-amber-700">No driver assigned</p>
                        )}
                        <div className="flex gap-2">
                            <select
                                value={selectedDriverId}
                                onChange={(event) =>
                                    onDriverSelect(
                                        order.id,
                                        Number(event.target.value)
                                    )
                                }
                                className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-green-400"
                            >
                                <option value="" disabled>
                                    Select driver
                                </option>
                                {drivers.map((driver) => (
                                    <option key={driver.userId} value={driver.userId}>
                                        {driverLabel(driver)}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                disabled={!selectedDriverId || isAssigning}
                                onClick={() => {
                                    if (selectedDriverId) {
                                        onAssignDriver(order.id, selectedDriverId);
                                    }
                                }}
                                className="shrink-0 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                            >
                                {isAssigning ? "…" : "Assign"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <span className="text-xs text-gray-400">—</span>
                )}
            </td>
            <td className="px-3 py-3">
                <select
                    value={order.status}
                    disabled={isUpdatingStatus}
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
    const { data: deliveries = [] } = useGetDeliveriesQuery(undefined, {
        skip: !isAuthed || !isSuperuser,
    });
    const { data: drivers = [] } = useGetDriverProfilesQuery(undefined, {
        skip: !isAuthed || !isSuperuser,
    });
    const [adminUpdateOrder, { isLoading: isUpdating }] = useAdminUpdateOrderMutation();
    const [assignDriverToOrder, { isLoading: isAssigning }] =
        useAssignDriverToOrderMutation();
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
    const [assigningOrderId, setAssigningOrderId] = useState<number | null>(null);
    const [selectedDrivers, setSelectedDrivers] = useState<Record<number, number>>({});

    const restaurantNames = useMemo(() => {
        const map = new Map<number, string>();
        restaurantsData?.data?.forEach((r) => map.set(r.id, r.name));
        return map;
    }, [restaurantsData]);

    const deliveryByOrderId = useMemo(() => {
        const map = new Map<number, Delivery>();
        for (const delivery of deliveries) {
            map.set(Number(delivery.orderId), delivery);
        }
        return map;
    }, [deliveries]);

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

    const handleAssignDriver = async (orderId: number, driverId: number) => {
        setAssigningOrderId(orderId);
        try {
            await assignDriverToOrder({ orderId, driverId }).unwrap();
            toast({
                title: "Driver assigned",
                description: `Order #${orderId} assigned to driver #${driverId}.`,
            });
        } catch {
            toast({
                title: "Assignment failed",
                description:
                    "Could not assign driver. They may be busy on another delivery, or delivery-service may be down.",
                variant: "destructive",
            });
        } finally {
            setAssigningOrderId(null);
        }
    };

    const getSelectedDriverId = (order: AdminOrder): number | "" => {
        if (selectedDrivers[order.id]) {
            return selectedDrivers[order.id];
        }
        const delivery = deliveryByOrderId.get(order.id);
        if (delivery?.driverId) {
            return delivery.driverId;
        }
        return drivers[0]?.userId ?? "";
    };

    return (
        <DashboardShell
            roleTitle="Admin - Orders"
            subtitle="Monitor all platform orders, review statuses, and assign drivers when needed."
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
                        <div>
                            <h3 className="font-[Poppins] text-lg font-bold text-gray-900">All Orders</h3>
                            <p className="mt-1 text-xs text-gray-500">
                                Assign drivers on paid or in-progress orders. Creates a delivery if one
                                does not exist yet.
                            </p>
                        </div>
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

                    {drivers.length === 0 ? (
                        <p className="mb-4 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                            No driver profiles found. Run{" "}
                            <code className="font-mono">npm run seed:drivers</code> in delivery-service
                            or sync from auth first.
                        </p>
                    ) : null}

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
                                        <th className="px-3 py-2">Driver</th>
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
                                            delivery={deliveryByOrderId.get(order.id)}
                                            drivers={drivers}
                                            selectedDriverId={getSelectedDriverId(order)}
                                            onDriverSelect={(orderId, driverId) =>
                                                setSelectedDrivers((prev) => ({
                                                    ...prev,
                                                    [orderId]: driverId,
                                                }))
                                            }
                                            onStatusChange={handleStatusChange}
                                            onAssignDriver={handleAssignDriver}
                                            isUpdatingStatus={
                                                isUpdating && updatingOrderId === order.id
                                            }
                                            isAssigning={
                                                isAssigning && assigningOrderId === order.id
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
