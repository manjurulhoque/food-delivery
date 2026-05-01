import { DashboardShell } from "@/components/dashboard-shell";
import { adminSidebarMenus } from "@/components/admin-sidebar-menus";

export default function AdminDashboardPage() {
    return (
        <DashboardShell
            roleTitle="Admin Dashboard"
            subtitle="Oversee platform activity, service health, and moderation across all user roles."
            sidebarMenus={adminSidebarMenus}
            stats={[
                { label: "Users", value: "1,240" },
                { label: "Restaurants", value: "118" },
                { label: "Drivers", value: "320" },
                { label: "Open Incidents", value: "3" },
            ]}
            cards={[
                {
                    title: "Platform Analytics",
                    description: "Monitor growth, conversion, and service usage across all modules.",
                    action: "View Analytics",
                },
                {
                    title: "Role Management",
                    description: "Manage permissions for customers, restaurants, drivers, and admins.",
                    action: "Manage Roles",
                },
                {
                    title: "Issue Triage",
                    description: "Review reported issues and coordinate cross-service fixes.",
                    action: "Open Incidents",
                },
            ]}
        />
    );
}
