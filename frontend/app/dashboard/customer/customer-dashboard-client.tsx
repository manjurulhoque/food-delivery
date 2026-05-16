"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/dashboard-shell";
import type { CustomerOrder } from "@/lib/services/order-api";
import { useGetMyOrdersQuery } from "@/lib/services/order-api";
import { useGetRestaurantsQuery } from "@/lib/services/restaurant-api";
import { cn } from "@/lib/utils";

const ACTIVE_STATUSES = new Set(["PENDING", "PAID", "CONFIRMED", "PREPARING"]);
const PAST_STATUSES = new Set(["DELIVERED", "CANCELED", "REFUNDED"]);

const customerSidebarMenus = [
    { label: "Overview", href: "/dashboard/customer" },
    {
        label: "Orders",
        subMenu: [
            { label: "Current Orders", href: "/dashboard/customer" },
            { label: "Order History", href: "/dashboard/customer/history" },
        ],
    },
    {
        label: "Profile",
        subMenu: [
            { label: "Saved Addresses", href: "/dashboard/customer/addresses" },
            { label: "Payment Methods", href: "/dashboard/customer/payments" },
        ],
    },
];

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

function OrderCard({
    order,
    restaurantNames,
}: {
    order: CustomerOrder;
    restaurantNames: Map<number, string>;
}) {
    const restaurantLabel =
        restaurantNames.get(order.restaurant_id) ?? `Restaurant #${order.restaurant_id}`;

    return (
        <article className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <p className="font-[Poppins] font-bold text-gray-900">Order #{order.id}</p>
                    <p className="text-sm text-gray-600">{restaurantLabel}</p>
                    <p className="mt-1 text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                        })}
                    </p>
                </div>
                <span
                    className={cn(
                        "rounded-full border px-2.5 py-1 text-xs font-bold",
                        statusBadgeClass(order.status)
                    )}
                >
                    {order.status.replace(/_/g, " ")}
                </span>
            </div>
            <p className="mt-3 text-sm text-gray-600">
                {order.items.length} line item{order.items.length === 1 ? "" : "s"} · $
                {Number(order.total_price).toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
                {order.items.map((i) => `Menu #${i.menu_id} × ${i.quantity}`).join(" · ")}
            </p>
        </article>
    );
}

function OrderSection({
    title,
    orders,
    restaurantNames,
}: {
    title: string;
    orders: CustomerOrder[];
    restaurantNames: Map<number, string>;
}) {
    if (orders.length === 0) return null;
    return (
        <div className="space-y-3">
            <h3 className="font-[Poppins] text-sm font-bold text-gray-800">{title}</h3>
            <div className="space-y-3">
                {orders.map((order) => (
                    <OrderCard key={order.id} order={order} restaurantNames={restaurantNames} />
                ))}
            </div>
        </div>
    );
}

function OrdersSkeleton() {
    return (
        <div className="animate-pulse space-y-4 rounded-2xl border border-gray-100 bg-white p-6">
            <div className="h-5 w-40 rounded bg-gray-100" />
            <div className="h-24 rounded-lg bg-gray-100" />
            <div className="h-24 rounded-lg bg-gray-100" />
        </div>
    );
}

export default function CustomerDashboardClient({
    variant = "overview",
}: {
    variant?: "overview" | "history";
}) {
    const pathname = usePathname();
    const { status } = useSession();
    const isAuthed = status === "authenticated";

    const { data: restaurantsData } = useGetRestaurantsQuery(undefined, {
        skip: !isAuthed,
    });

    const { data: ordersData, isLoading, isError, isFetching } = useGetMyOrdersQuery(undefined, {
        skip: !isAuthed,
    });

    const restaurantNames = useMemo(() => {
        const map = new Map<number, string>();
        restaurantsData?.data?.forEach((r) => map.set(r.id, r.name));
        return map;
    }, [restaurantsData]);

    const orders = ordersData?.orders ?? [];

    const activeOrders = useMemo(
        () => orders.filter((o) => ACTIVE_STATUSES.has(o.status)),
        [orders]
    );
    const pastOrders = useMemo(() => orders.filter((o) => PAST_STATUSES.has(o.status)), [orders]);

    const stats = useMemo(
        () => [
            { label: "Active Orders", value: String(activeOrders.length) },
            { label: "Past Orders", value: String(pastOrders.length) },
            { label: "Total Orders", value: String(orders.length) },
            { label: "Saved Addresses", value: "—" },
        ],
        [activeOrders.length, pastOrders.length, orders.length]
    );

    const overviewCards = [
        {
            title: "Current Orders",
            description:
                "Check preparation and delivery progress for your latest orders in real time.",
            action: "View Orders",
        },
        {
            title: "Favorite Restaurants",
            description: "Quickly reorder from restaurants you visit most often.",
            action: "Manage Favorites",
        },
        {
            title: "Saved Payments",
            description: "Securely manage cards and payment preferences for faster checkout.",
            action: "Manage Payments",
        },
    ];

    return (
        <DashboardShell
            roleTitle={variant === "history" ? "Order history" : "Customer Dashboard"}
            subtitle={
                variant === "history"
                    ? "Review delivered and canceled orders."
                    : "Track your orders, manage saved addresses, and discover personalized recommendations."
            }
            sidebarMenus={customerSidebarMenus}
            stats={stats}
            cards={variant === "history" ? [] : overviewCards}
        >
            {!isAuthed ? (
                <div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-5 py-6 text-sm text-amber-900">
                    <p className="font-semibold">Sign in to see your orders</p>
                    <p className="mt-1 text-amber-800/90">
                        Your order history is available after you log in with your customer account.
                    </p>
                    <Link
                        href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
                        className="mt-4 inline-flex text-xs font-bold text-green-700 underline underline-offset-2 hover:text-green-800"
                    >
                        Go to login
                    </Link>
                </div>
            ) : isLoading ? (
                <OrdersSkeleton />
            ) : isError ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-6 text-sm text-red-900">
                    <p className="font-semibold">Could not load orders</p>
                    <p className="mt-1 text-red-800/90">
                        Try refreshing the page. If you recently signed in, your session may still be
                        updating.
                    </p>
                </div>
            ) : variant === "history" ? (
                pastOrders.length === 0 ? (
                    <EmptyOrders hint="Completed and canceled orders will show up here." />
                ) : (
                    <div className="space-y-3">
                        {pastOrders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                restaurantNames={restaurantNames}
                            />
                        ))}
                    </div>
                )
            ) : orders.length === 0 ? (
                <EmptyOrders />
            ) : (
                <div className="space-y-8">
                    <OrderSection
                        title="Active orders"
                        orders={activeOrders}
                        restaurantNames={restaurantNames}
                    />
                    <OrderSection
                        title="Past orders"
                        orders={pastOrders}
                        restaurantNames={restaurantNames}
                    />
                </div>
            )}
            {isAuthed && !isLoading && !isError && isFetching ? (
                <p className="mt-3 text-center text-xs text-gray-400">Updating…</p>
            ) : null}
        </DashboardShell>
    );
}

function EmptyOrders({ hint }: { hint?: string }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white px-6 py-10 text-center">
            <p className="font-[Poppins] text-lg font-bold text-gray-900">No orders yet</p>
            <p className="mt-2 text-sm text-gray-500">
                {hint ?? "Browse the menu and place your first order — it will appear here."}
            </p>
            <Link
                href="/menu"
                className="mt-5 inline-flex rounded-full bg-green-600 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-green-700"
            >
                Explore menu
            </Link>
        </div>
    );
}
