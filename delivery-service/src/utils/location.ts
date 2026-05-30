import type { Location } from "../types/delivery";

const BASE_LAT = 37.7749;
const BASE_LNG = -122.4194;

export function coordsForSeed(id: number): Pick<Location, "latitude" | "longitude"> {
    const n = id % 500;
    return {
        latitude: BASE_LAT + n * 0.002,
        longitude: BASE_LNG + n * 0.003,
    };
}

export function buildPickupLocation(restaurantId: number, address?: string): Location {
    const coords = coordsForSeed(restaurantId);
    return {
        ...coords,
        address: address ?? `Restaurant #${restaurantId}`,
    };
}

export function buildDeliveryLocation(userId: number, pickup: Location): Location {
    const coords = coordsForSeed(userId + 1000);
    return {
        latitude: coords.latitude + 0.01,
        longitude: coords.longitude + 0.01,
        address: `Customer delivery (user ${userId})`,
    };
}

export function haversineKm(
    a: Pick<Location, "latitude" | "longitude">,
    b: Pick<Location, "latitude" | "longitude">
): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(b.latitude - a.latitude);
    const dLng = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);

    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

    return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
