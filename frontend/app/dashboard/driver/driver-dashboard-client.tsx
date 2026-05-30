"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/dashboard-shell";
import { DriverAvailabilityPanel } from "@/components/driver-availability-panel";
import {
    useGetDriverByUserIdQuery,
} from "@/lib/services/delivery-api";

const driverSidebarMenus = [
    { label: "Overview", href: "/dashboard/driver" },
    {
        label: "Deliveries",
        subMenu: [
            { label: "Assigned Tasks", href: "/dashboard/driver" },
            { label: "Completed Tasks", href: "/dashboard/driver/completed" },
        ],
    },
    {
        label: "Earnings",
        subMenu: [
            { label: "Today", href: "/dashboard/driver/earnings" },
            { label: "Payout History", href: "/dashboard/driver/payouts" },
        ],
    },
    { label: "Availability", href: "/dashboard/driver/availability" },
];

export default function DriverDashboardClient({
    variant = "overview",
}: {
    variant?: "overview" | "availability";
}) {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const isAuthed = status === "authenticated";
    const userId = session?.user?.id ? Number(session.user.id) : undefined;

    const { data: profile } = useGetDriverByUserIdQuery(userId!, {
        skip: !userId || !session?.user?.is_driver,
    });

    const onlineLabel = profile?.isOnline ? "Online" : "Offline";

    const stats = [
        { label: "Status", value: isAuthed && session?.user?.is_driver ? onlineLabel : "—" },
        { label: "Assigned Deliveries", value: "—" },
        { label: "Completed Today", value: "—" },
        { label: "Earnings Today", value: "—" },
    ];

    const overviewCards = [
        {
            title: "Delivery Tasks",
            description: "Review newly assigned tasks with pickup and drop-off details.",
            action: "View Tasks",
        },
        {
            title: "Delivery History",
            description: "Track completed deliveries and resolve disputes quickly.",
            action: "Open History",
        },
        {
            title: "Availability",
            description: "Go online to receive auto-assigned deliveries from paid orders.",
            action: "Manage Status",
        },
    ];

    return (
        <DashboardShell
            roleTitle={
                variant === "availability" ? "Availability" : "Driver Dashboard"
            }
            subtitle={
                variant === "availability"
                    ? "Control when you are eligible for new delivery assignments."
                    : "See available delivery tasks, track completed deliveries, and monitor your earnings."
            }
            sidebarMenus={driverSidebarMenus}
            stats={stats}
            cards={variant === "availability" ? [] : overviewCards}
        >
            {!isAuthed ? (
                <div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-5 py-6 text-sm text-amber-900">
                    <p className="font-semibold">Sign in to access the driver dashboard</p>
                    <Link
                        href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
                        className="mt-4 inline-flex text-xs font-bold text-green-700 underline underline-offset-2 hover:text-green-800"
                    >
                        Go to login
                    </Link>
                </div>
            ) : (
                <DriverAvailabilityPanel compact={variant === "availability"} />
            )}
        </DashboardShell>
    );
}
