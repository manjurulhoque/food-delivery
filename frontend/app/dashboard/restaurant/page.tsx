import { DashboardShell } from "@/components/dashboard-shell";

export default function RestaurantDashboardPage() {
    return (
        <DashboardShell
            roleTitle="Restaurant Dashboard"
            subtitle="Manage menus, monitor incoming orders, and keep your restaurant performance healthy."
            sidebarMenus={[
                { label: "Overview", href: "/dashboard/restaurant" },
                {
                    label: "Orders",
                    subMenu: [
                        { label: "New Orders", href: "/dashboard/restaurant" },
                        { label: "Completed Orders", href: "/dashboard/restaurant/completed" },
                    ],
                },
                {
                    label: "Menus",
                    subMenu: [
                        { label: "All Menus", href: "/dashboard/restaurant/menus" },
                        { label: "Menu Categories", href: "/dashboard/restaurant/categories" },
                    ],
                },
                { label: "Restaurant Profile", href: "/dashboard/restaurant/profile" },
            ]}
            stats={[
                { label: "New Orders", value: "14" },
                { label: "Menus", value: "32" },
                { label: "Avg Rating", value: "4.6" },
                { label: "Revenue Today", value: "$860" },
            ]}
            cards={[
                {
                    title: "Order Queue",
                    description: "Accept, prepare, and mark customer orders as ready from one place.",
                    action: "Open Queue",
                },
                {
                    title: "Menu Management",
                    description: "Create dishes, assign categories, and adjust prices quickly.",
                    action: "Edit Menus",
                },
                {
                    title: "Restaurant Profile",
                    description: "Update business details, operating hours, and delivery settings.",
                    action: "Update Profile",
                },
            ]}
        />
    );
}
