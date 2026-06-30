import DriverDashboardClient from "@/app/dashboard/driver/driver-dashboard-client";

export const metadata = {
	title: "Payouts — Driver Dashboard",
};

export default function PayoutsPage() {
	return <DriverDashboardClient variant="payouts" />;
}
