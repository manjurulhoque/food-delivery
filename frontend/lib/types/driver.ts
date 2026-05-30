export type DriverLocation = {
    latitude: number;
    longitude: number;
    address?: string;
};

export type DriverProfile = {
    id: string;
    userId: number;
    email: string | null;
    phone: string | null;
    isOnline: boolean;
    vehicleType: string | null;
    licensePlate: string | null;
    latitude: number | null;
    longitude: number | null;
    lastLocationAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export type CreateDriverProfilePayload = {
    userId: number;
    email?: string;
    phone?: string;
    isOnline?: boolean;
    vehicleType?: string;
    licensePlate?: string;
};

export type UpdateDriverAvailabilityPayload = {
    userId: number;
    isOnline: boolean;
};
