export type DeliveryLocation = {
	latitude: number;
	longitude: number;
	address: string;
};

export type DeliveryStatus =
	| "PENDING"
	| "ASSIGNED"
	| "PICKED_UP"
	| "IN_TRANSIT"
	| "DELIVERED"
	| "CANCELLED";

export type Delivery = {
	id: string;
	orderId: string;
	driverId?: number;
	status: DeliveryStatus;
	pickupLocation: DeliveryLocation;
	deliveryLocation: DeliveryLocation;
	estimatedDeliveryTime: string;
	actualDeliveryTime?: string;
	deliveryFee?: number;
	createdAt: string;
	updatedAt: string;
};

export type DriverEarnings = {
	todayEarnings: number;
	weekEarnings: number;
	monthEarnings: number;
	totalEarnings: number;
	totalCompleted: number;
	recentEarnings: Array<{
		deliveryId: string;
		orderId: string;
		fee: number;
		completedAt: string;
	}>;
};
