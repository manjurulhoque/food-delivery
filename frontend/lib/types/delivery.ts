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
    createdAt: string;
    updatedAt: string;
};
