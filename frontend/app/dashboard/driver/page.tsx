import { DashboardShell } from "@/components/dashboard-shell";

export default function DriverDashboardPage() {
    return (
        <DashboardShell
            roleTitle="Driver Dashboard"
            subtitle="See available delivery tasks, track completed deliveries, and monitor your earnings."
            sidebarMenus={[
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
            ]}
            stats={[
                { label: "Assigned Deliveries", value: "5" },
                { label: "Completed Today", value: "11" },
                { label: "Avg Delivery Time", value: "24m" },
                { label: "Earnings Today", value: "$92" },
            ]}
            cards={[
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
                    description: "Set online status and preferred delivery zones.",
                    action: "Update Status",
                },
            ]}
        />
    );
}
