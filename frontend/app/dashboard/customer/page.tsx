import { DashboardShell } from "@/components/dashboard-shell";

export default function CustomerDashboardPage() {
    return (
        <DashboardShell
            roleTitle="Customer Dashboard"
            subtitle="Track your orders, manage saved addresses, and discover personalized recommendations."
            sidebarMenus={[
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
            ]}
            stats={[
                { label: "Active Orders", value: "2" },
                { label: "Past Orders", value: "18" },
                { label: "Saved Addresses", value: "3" },
                { label: "Reward Points", value: "420" },
            ]}
            cards={[
                {
                    title: "Current Orders",
                    description: "Check preparation and delivery progress for your latest orders in real time.",
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
            ]}
        />
    );
}
