"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/dashboard-shell";
import { DriverAvailabilityPanel } from "@/components/driver-availability-panel";
import {
	useGetDriverByUserIdQuery,
	useGetDeliveriesByDriverQuery,
} from "@/lib/services/delivery-api";
import { MapPin, Package, Clock, ChevronRight } from "lucide-react";
import type { Delivery } from "@/lib/types/delivery";

const STATUS_LABEL: Record<string, string> = {
	PENDING: "Pending",
	ASSIGNED: "Assigned",
	PICKED_UP: "Picked Up",
	IN_TRANSIT: "In Transit",
	DELIVERED: "Delivered",
	CANCELLED: "Cancelled",
};

const STATUS_COLOR: Record<string, string> = {
	PENDING: "bg-amber-100 text-amber-800",
	ASSIGNED: "bg-blue-100 text-blue-800",
	PICKED_UP: "bg-indigo-100 text-indigo-800",
	IN_TRANSIT: "bg-purple-100 text-purple-800",
	DELIVERED: "bg-green-100 text-green-800",
	CANCELLED: "bg-red-100 text-red-800",
};

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

function DriverDeliveryRow({ delivery }: { delivery: Delivery }) {
	return (
		<Link
			href={`/dashboard/driver/${delivery.id}`}
			className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-colors hover:border-green-200 hover:bg-green-50/30"
		>
			<div className="min-w-0 flex-1 space-y-2">
				<div className="flex flex-wrap items-center gap-2">
					<span className="font-[Poppins] text-sm font-bold text-gray-900">
						Order #{delivery.orderId}
					</span>
					<span
						className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_COLOR[delivery.status] || "bg-gray-100 text-gray-700"}`}
					>
						{STATUS_LABEL[delivery.status] || delivery.status}
					</span>
				</div>
				<div className="flex flex-col gap-1 text-xs text-gray-500">
					<span className="flex items-center gap-1.5">
						<MapPin className="h-3.5 w-3.5 shrink-0 text-green-600" />
						<span className="truncate">
							{delivery.pickupLocation.address}
						</span>
					</span>
					<span className="flex items-center gap-1.5">
						<MapPin className="h-3.5 w-3.5 shrink-0 text-red-500" />
						<span className="truncate">
							{delivery.deliveryLocation.address}
						</span>
					</span>
				</div>
				<span className="flex items-center gap-1.5 text-xs text-gray-400">
					<Clock className="h-3.5 w-3.5" />
					Est.{" "}
					{new Date(
						delivery.estimatedDeliveryTime,
					).toLocaleTimeString("en-US", {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</span>
			</div>
			<ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-300" />
		</Link>
	);
}

export default function DriverDashboardClient({
	variant = "overview",
}: {
	variant?: "overview" | "availability";
}) {
	const pathname = usePathname();
	const { data: session, status } = useSession();
	const isAuthed = status === "authenticated";
	const isDriver = Boolean(session?.user?.is_driver);
	const userId = session?.user?.id ? Number(session.user.id) : undefined;

	const { data: profile } = useGetDriverByUserIdQuery(userId!, {
		skip: !userId || !isDriver,
	});

	const { data: deliveries = [], isLoading: deliveriesLoading } =
		useGetDeliveriesByDriverQuery(userId!, {
			skip: !userId || !isDriver || !profile?.isOnline,
		});

	const activeDeliveries = deliveries.filter(
		(d) => d.status !== "DELIVERED" && d.status !== "CANCELLED",
	);
	const completedDeliveries = deliveries.filter(
		(d) => d.status === "DELIVERED",
	);
	const completedToday = completedDeliveries.filter((d) => {
		if (!d.actualDeliveryTime) return false;
		const today = new Date();
		const delivered = new Date(d.actualDeliveryTime);
		return (
			delivered.getDate() === today.getDate() &&
			delivered.getMonth() === today.getMonth() &&
			delivered.getFullYear() === today.getFullYear()
		);
	});

	const onlineLabel = profile?.isOnline ? "Online" : "Offline";

	const stats = [
		{
			label: "Status",
			value: isAuthed && isDriver ? onlineLabel : "—",
		},
		{
			label: "Active Deliveries",
			value: deliveriesLoading ? "…" : String(activeDeliveries.length),
		},
		{
			label: "Completed Today",
			value: deliveriesLoading ? "…" : String(completedToday.length),
		},
		{
			label: "Earnings Today",
			value: "—",
		},
	];

	const overviewCards = [
		{
			title: "Delivery Tasks",
			description:
				activeDeliveries.length > 0
					? `You have ${activeDeliveries.length} active task${activeDeliveries.length > 1 ? "s" : ""}. View pickup and drop-off details below.`
					: "No active deliveries right now. Go online to receive assignments.",
			action: activeDeliveries.length > 0 ? "View Tasks" : "Go Online",
		},
		{
			title: "Delivery History",
			description: `Track ${completedDeliveries.length} completed order${completedDeliveries.length !== 1 ? "s" : ""} and review delivery details.`,
			action: "Open History",
		},
		{
			title: "Availability",
			description: profile?.isOnline
				? "You are online and eligible for new delivery assignments."
				: "Go online to receive auto-assigned deliveries from paid orders.",
			action: profile?.isOnline ? "Online" : "Offline",
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
			{status === "loading" ? (
				<div className="flex items-center justify-center py-20">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
				</div>
			) : !isAuthed ? (
				<div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-5 py-6 text-sm text-amber-900">
					<p className="font-semibold">
						Sign in to access the driver dashboard
					</p>
					<Link
						href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
						className="mt-4 inline-flex text-xs font-bold text-green-700 underline underline-offset-2 hover:text-green-800"
					>
						Go to login
					</Link>
				</div>
			) : variant === "availability" ? (
				<DriverAvailabilityPanel compact />
			) : (
				<div className="space-y-5">
					<DriverAvailabilityPanel compact />

					{deliveriesLoading ? (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className="h-24 animate-pulse rounded-xl border border-gray-100 bg-gray-50"
								/>
							))}
						</div>
					) : activeDeliveries.length > 0 ? (
						<div>
							<h3 className="mb-3 flex items-center gap-2 font-[Poppins] text-base font-bold text-gray-900">
								<Package className="h-4 w-4 text-green-600" />
								Active Deliveries
								<span className="ml-auto text-xs font-normal text-gray-400">
									{activeDeliveries.length} task
									{activeDeliveries.length > 1 ? "s" : ""}
								</span>
							</h3>
							<div className="space-y-3">
								{activeDeliveries.map((delivery) => (
									<DriverDeliveryRow
										key={delivery.id}
										delivery={delivery}
									/>
								))}
							</div>
						</div>
					) : isDriver && profile?.isOnline ? (
						<div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
							<Package className="mx-auto h-8 w-8 text-gray-300" />
							<p className="mt-3 font-[Poppins] text-sm font-bold text-gray-700">
								No active deliveries
							</p>
							<p className="mt-1 text-xs text-gray-400">
								You will see assigned deliveries here once a
								customer places an order.
							</p>
						</div>
					) : null}
				</div>
			)}
		</DashboardShell>
	);
}
