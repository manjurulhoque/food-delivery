import axios from "axios";
import { Repository } from "typeorm";

import { AppDataSource } from "../config/database";
import { Driver } from "../models/driver";
import { Delivery } from "../models/delivery";
import { DeliveryStatus } from "../types/delivery";
import type { CreateDriverProfilePayload, DriverLocation } from "../types/driver";
import type { Location } from "../types/delivery";
import { haversineKm } from "../utils/location";

const ACTIVE_DELIVERY_STATUSES = [
    DeliveryStatus.ASSIGNED,
    DeliveryStatus.PICKED_UP,
    DeliveryStatus.IN_TRANSIT,
];

type AuthUser = {
    id: number;
    email: string;
    is_driver: boolean;
};

export class DriverService {
    private driverRepository: Repository<Driver>;
    private deliveryRepository: Repository<Delivery>;
    private authServiceUrl: string;

    constructor() {
        this.driverRepository = AppDataSource.getRepository(Driver);
        this.deliveryRepository = AppDataSource.getRepository(Delivery);
        this.authServiceUrl = process.env.AUTH_SERVICE_URL || "http://auth-service:5000";
    }

    async getByUserId(userId: number): Promise<Driver | null> {
        return this.driverRepository.findOne({ where: { userId } });
    }

    async listProfiles(): Promise<Driver[]> {
        return this.driverRepository.find({ order: { userId: "ASC" } });
    }

    async createProfile(data: CreateDriverProfilePayload): Promise<Driver> {
        const authUser = await this.fetchAuthUser(data.userId);
        if (!authUser?.is_driver) {
            throw new Error("User is not a driver in auth-service");
        }

        const existing = await this.getByUserId(data.userId);
        if (existing) {
            return existing;
        }

        const profile = this.driverRepository.create({
            userId: data.userId,
            email: data.email ?? authUser.email,
            phone: data.phone ?? null,
            isOnline: data.isOnline ?? false,
            vehicleType: data.vehicleType ?? "bike",
            licensePlate: data.licensePlate ?? null,
        });

        return this.driverRepository.save(profile);
    }

    async setAvailability(userId: number, isOnline: boolean): Promise<Driver | null> {
        const profile = await this.getByUserId(userId);
        if (!profile) return null;

        profile.isOnline = isOnline;
        return this.driverRepository.save(profile);
    }

    async updateLocation(userId: number, location: DriverLocation): Promise<Driver | null> {
        const profile = await this.getByUserId(userId);
        if (!profile) return null;

        profile.latitude = location.latitude;
        profile.longitude = location.longitude;
        profile.lastLocationAt = new Date();
        return this.driverRepository.save(profile);
    }

    async getAvailableDrivers(): Promise<Driver[]> {
        const busyDriverIds = await this.getBusyDriverUserIds();
        const onlineDrivers = await this.driverRepository.find({
            where: { isOnline: true },
            order: { userId: "ASC" },
        });

        if (busyDriverIds.length === 0) {
            return onlineDrivers;
        }

        return onlineDrivers.filter((d) => !busyDriverIds.includes(d.userId));
    }

    async pickBestAvailableDriver(pickup: Location): Promise<Driver | null> {
        const available = await this.getAvailableDrivers();
        if (available.length === 0) return null;

        const withLocation = available.filter(
            (d) => d.latitude != null && d.longitude != null
        );
        if (withLocation.length === 0) {
            return available[0];
        }

        return withLocation.sort((a, b) => {
            const distA = haversineKm(pickup, {
                latitude: a.latitude!,
                longitude: a.longitude!,
            });
            const distB = haversineKm(pickup, {
                latitude: b.latitude!,
                longitude: b.longitude!,
            });
            return distA - distB;
        })[0];
    }

    async isDriverAvailable(userId: number): Promise<boolean> {
        const profile = await this.getByUserId(userId);
        if (!profile?.isOnline) return false;

        const busy = await this.getBusyDriverUserIds();
        return !busy.includes(userId);
    }

    async isDriverBusy(userId: number, excludeDeliveryId?: string): Promise<boolean> {
        const rows = await this.deliveryRepository
            .createQueryBuilder("delivery")
            .select("delivery.id", "id")
            .where("delivery.driverId = :userId", { userId })
            .andWhere("delivery.status IN (:...statuses)", {
                statuses: ACTIVE_DELIVERY_STATUSES,
            })
            .getRawMany<{ id: string }>();

        if (!excludeDeliveryId) {
            return rows.length > 0;
        }

        return rows.some((row) => row.id !== excludeDeliveryId);
    }

    async syncFromAuth(): Promise<{ created: number; skipped: number }> {
        const authDrivers = await this.fetchAuthDrivers();
        let created = 0;
        let skipped = 0;

        for (const user of authDrivers) {
            const exists = await this.getByUserId(user.id);
            if (exists) {
                skipped += 1;
                continue;
            }

            await this.createProfile({
                userId: user.id,
                email: user.email,
                isOnline: user.id % 3 === 0,
                vehicleType: user.id % 2 === 0 ? "bike" : "scooter",
                licensePlate: `FD-${String(user.id).padStart(4, "0")}`,
            });
            created += 1;
        }

        return { created, skipped };
    }

    private async getBusyDriverUserIds(): Promise<number[]> {
        const rows = await this.deliveryRepository
            .createQueryBuilder("delivery")
            .select("delivery.driverId", "driverId")
            .where("delivery.status IN (:...statuses)", {
                statuses: ACTIVE_DELIVERY_STATUSES,
            })
            .andWhere("delivery.driverId IS NOT NULL")
            .getRawMany<{ driverId: number }>();

        return [...new Set(rows.map((row) => Number(row.driverId)).filter(Number.isFinite))];
    }

    private async fetchAuthUser(userId: number): Promise<AuthUser | null> {
        try {
            const response = await axios.get(
                `${this.authServiceUrl}/internal/users/${userId}/`
            );
            return response.data?.data?.user ?? null;
        } catch {
            return null;
        }
    }

    private async fetchAuthDrivers(): Promise<AuthUser[]> {
        try {
            const response = await axios.get(
                `${this.authServiceUrl}/internal/users/drivers/`
            );
            return response.data?.data ?? [];
        } catch (error) {
            console.error("Failed to fetch drivers from auth-service:", error);
            return [];
        }
    }
}
