import { AppDataSource } from "../config/database";
import { Delivery } from "../models/delivery";
import { DeliveryStatus } from "../types/delivery";
import { Repository } from "typeorm";
import { DriverService } from "./driver.service";

export class DeliveryService {
    private deliveryRepository: Repository<Delivery>;
    private driverService: DriverService;

    constructor() {
        this.deliveryRepository = AppDataSource.getRepository(Delivery);
        this.driverService = new DriverService();
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
        driverUserId: string
    ): Promise<Delivery | null> {
        const userId = parseInt(driverUserId, 10);
        if (!Number.isFinite(userId)) return null;

        const profile = await this.driverService.getByUserId(userId);
        if (!profile) return null;

        const available = await this.driverService.isDriverAvailable(userId);
        if (!available) return null;

        const delivery = await this.getDeliveryById(deliveryId);
        if (!delivery) return null;

        delivery.driverId = userId;
        delivery.status = DeliveryStatus.ASSIGNED;

        return await this.deliveryRepository.save(delivery);
    }

    async getDeliveriesByDriver(driverUserId: number): Promise<Delivery[]> {
        return await this.deliveryRepository.find({ where: { driverId: driverUserId } });
    }

    async getActiveDeliveries(): Promise<Delivery[]> {
        return await this.deliveryRepository.find({
            where: {
                status: DeliveryStatus.IN_TRANSIT,
            },
        });
    }
}
