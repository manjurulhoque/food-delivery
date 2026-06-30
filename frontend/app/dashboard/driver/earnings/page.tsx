import DriverDashboardClient from "@/app/dashboard/driver/driver-dashboard-client";

export const metadata = {
	title: "Earnings — Driver Dashboard",
};

export default function EarningsPage() {
	return <DriverDashboardClient variant="earnings" />;
}
