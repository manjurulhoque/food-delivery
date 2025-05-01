export interface Delivery {
    id: string;
    orderId: string;
    driverId: string;
    status: DeliveryStatus;
    pickupLocation: Location;
    deliveryLocation: Location;
    estimatedDeliveryTime: Date;
    actualDeliveryTime?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface Location {
    latitude: number;
    longitude: number;
    address: string;
}

export enum DeliveryStatus {
    PENDING = "PENDING",
    ASSIGNED = "ASSIGNED",
    PICKED_UP = "PICKED_UP",
    IN_TRANSIT = "IN_TRANSIT",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
}

export interface DeliveryDriver {
    id: string;
    name: string;
    phoneNumber: string;
    vehicleType: string;
    licensePlate: string;
    isAvailable: boolean;
    currentLocation?: Location;
}
