export const adminSidebarMenus = [
    { label: "Overview", href: "/dashboard/admin" },
    {
        label: "Management",
        subMenu: [
            { label: "Restaurants", href: "/dashboard/admin/restaurants" },
            { label: "Menus", href: "/dashboard/admin/menus" },
            { label: "Menu Categories", href: "/dashboard/admin/categories" },
        ],
    },
    {
        label: "Operations",
        subMenu: [
            { label: "Orders Monitor", href: "/dashboard/admin/orders" },
            { label: "Disputes", href: "/dashboard/admin/disputes" },
        ],
    },
    { label: "System Health", href: "/dashboard/admin/system" },
];
