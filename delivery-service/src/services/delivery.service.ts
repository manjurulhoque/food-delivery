import { AppDataSource } from "../config/database";
import { Delivery } from "../models/delivery";
import { DeliveryStatus } from "../types/delivery";
import { Repository } from "typeorm";
import axios from "axios";

export class DeliveryService {
    private deliveryRepository: Repository<Delivery>;
    private authServiceUrl: string;

    constructor() {
        this.deliveryRepository = AppDataSource.getRepository(Delivery);
        this.authServiceUrl = process.env.AUTH_SERVICE_URL || "http://auth-service:5000";
    }

    async createDelivery(deliveryData: Partial<Delivery>): Promise<Delivery> {
        const delivery = this.deliveryRepository.create(deliveryData);
        return await this.deliveryRepository.save(delivery);
    }

    async getDeliveryById(id: string): Promise<Delivery | null> {
        return await this.deliveryRepository.findOne({ where: { id } });
    }

    async updateDeliveryStatus(
        id: string,
        status: DeliveryStatus
    ): Promise<Delivery | null> {
        const delivery = await this.getDeliveryById(id);
        if (!delivery) return null;

        delivery.status = status;
        if (status === DeliveryStatus.DELIVERED) {
            delivery.actualDeliveryTime = new Date();
        }

        return await this.deliveryRepository.save(delivery);
    }

    async assignDriver(
        deliveryId: string,
        driverId: string
    ): Promise<Delivery | null> {
        try {
            // Verify driver exists and is available
            const response = await axios.get(
                `${this.authServiceUrl}/api/users/${driverId}`
            );
            const driver = response.data;

            if (!driver || !driver.is_driver) {
                return null;
            }

            const delivery = await this.getDeliveryById(deliveryId);
            if (!delivery) return null;

            delivery.driverId = parseInt(driverId);
            delivery.status = DeliveryStatus.ASSIGNED;

            return await this.deliveryRepository.save(delivery);
        } catch (error) {
            console.error("Error assigning driver:", error);
            return null;
        }
    }

    async getAvailableDrivers(): Promise<any[]> {
        try {
            const response = await axios.get(
                `${this.authServiceUrl}/api/users/drivers`
            );
            return response.data;
        } catch (error) {
            console.error("Error getting available drivers:", error);
            return [];
        }
    }

    async updateDriverLocation(
        driverId: string,
        location: any
    ): Promise<boolean> {
        try {
            await axios.patch(
                `${this.authServiceUrl}/api/users/${driverId}/location`,
                { location }
            );
            return true;
        } catch (error) {
            console.error("Error updating driver location:", error);
            return false;
        }
    }

    async getDeliveriesByDriver(driverId: number): Promise<Delivery[]> {
        return await this.deliveryRepository.find({ where: { driverId } });
    }

    async getActiveDeliveries(): Promise<Delivery[]> {
        return await this.deliveryRepository.find({
            where: {
                status: DeliveryStatus.IN_TRANSIT,
            },
        });
    }
}
