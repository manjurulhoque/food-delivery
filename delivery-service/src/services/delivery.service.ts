import { AppDataSource } from "../config/database";
import { Delivery } from "../models/delivery";
import { DeliveryStatus } from "../types/delivery";
import { Repository } from "typeorm";
import { DriverService } from "./driver.service";
import { OrderClient } from "../clients/order.client";
import { RestaurantClient } from "../clients/restaurant.client";
import { buildDeliveryLocation, buildPickupLocation } from "../utils/location";
import type { PaymentCompletedEvent } from "../types/kafka";
import { publishDeliveryAssigned } from "../kafka/producer";
import logger from "../config/logger";

export class DeliveryService {
    private deliveryRepository: Repository<Delivery>;
    private driverService: DriverService;
    private orderClient: OrderClient;
    private restaurantClient: RestaurantClient;

    constructor() {
        this.deliveryRepository = AppDataSource.getRepository(Delivery);
        this.driverService = new DriverService();
        this.orderClient = new OrderClient();
        this.restaurantClient = new RestaurantClient();
    }

    async createDelivery(deliveryData: Partial<Delivery>): Promise<Delivery> {
        const delivery = this.deliveryRepository.create(deliveryData);
        return await this.deliveryRepository.save(delivery);
    }

    async getDeliveryById(id: string): Promise<Delivery | null> {
        return await this.deliveryRepository.findOne({ where: { id } });
    }

    async getDeliveryByOrderId(orderId: string): Promise<Delivery | null> {
        return await this.deliveryRepository.findOne({ where: { orderId } });
    }

    async handlePaymentCompleted(
        event: PaymentCompletedEvent,
    ): Promise<Delivery | null> {
        const orderId = String(event.order_id);

        const existing = await this.getDeliveryByOrderId(orderId);
        if (existing) {
            logger.info(`Delivery already exists for order ${orderId}`);
            return existing;
        }

        const order = await this.orderClient.getOrder(event.order_id);
        if (!order) {
            logger.error(
                `Order ${event.order_id} not found for delivery creation`,
            );
            return null;
        }

        const restaurant = await this.restaurantClient.getRestaurant(
            order.restaurant_id,
        );
        const pickupLocation = buildPickupLocation(
            order.restaurant_id,
            restaurant?.address ?? restaurant?.name,
        );
        const deliveryLocation = buildDeliveryLocation(
            order.user_id,
            pickupLocation,
        );
        const estimatedDeliveryTime = new Date(Date.now() + 45 * 60 * 1000);

        let delivery = await this.createDelivery({
            orderId,
            status: DeliveryStatus.PENDING,
            pickupLocation,
            deliveryLocation,
            estimatedDeliveryTime,
        });

        const driver =
            await this.driverService.pickBestAvailableDriver(pickupLocation);
        if (!driver) {
            logger.warn(`No available driver for order ${orderId}`);
            return delivery;
        }

        const assigned = await this.assignDriver(
            delivery.id,
            String(driver.userId),
        );
        if (!assigned) {
            logger.warn(
                `Failed to assign driver ${driver.userId} to order ${orderId}`,
            );
            return delivery;
        }

        delivery = assigned;
        await publishDeliveryAssigned({
            delivery_id: delivery.id,
            order_id: event.order_id,
            user_id: order.user_id,
            driver_user_id: driver.userId,
        });
        logger.info(
            `Auto-assigned driver ${driver.userId} to delivery ${delivery.id} (order ${orderId})`,
        );

        return delivery;
    }

    async updateDeliveryStatus(
        id: string,
        status: DeliveryStatus,
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
        driverUserId: string,
        options?: { allowOffline?: boolean },
    ): Promise<Delivery | null> {
        const userId = parseInt(driverUserId, 10);
        if (!Number.isFinite(userId)) return null;

        const profile = await this.driverService.getByUserId(userId);
        if (!profile) return null;

        const delivery = await this.getDeliveryById(deliveryId);
        if (!delivery) return null;

        const busy = await this.driverService.isDriverBusy(userId, deliveryId);
        if (busy) return null;

        if (!options?.allowOffline) {
            const available =
                await this.driverService.isDriverAvailable(userId);
            if (!available) return null;
        } else if (!profile.isOnline) {
            // Admin may assign offline drivers; still require a profile.
        }

        delivery.driverId = userId;
        delivery.status = DeliveryStatus.ASSIGNED;

        return await this.deliveryRepository.save(delivery);
    }

    async ensureDeliveryForOrder(orderId: number): Promise<Delivery | null> {
        const orderIdStr = String(orderId);
        const existing = await this.getDeliveryByOrderId(orderIdStr);
        if (existing) return existing;

        const order = await this.orderClient.getOrder(orderId);
        if (!order) return null;

        const restaurant = await this.restaurantClient.getRestaurant(
            order.restaurant_id,
        );
        const pickupLocation = buildPickupLocation(
            order.restaurant_id,
            restaurant?.address ?? restaurant?.name,
        );
        const deliveryLocation = buildDeliveryLocation(
            order.user_id,
            pickupLocation,
        );

        return this.createDelivery({
            orderId: orderIdStr,
            status: DeliveryStatus.PENDING,
            pickupLocation,
            deliveryLocation,
            estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000),
        });
    }

    async assignDriverToOrder(
        orderId: number,
        driverUserId: string,
    ): Promise<Delivery | null> {
        const delivery = await this.ensureDeliveryForOrder(orderId);
        if (!delivery) return null;

        const assigned = await this.assignDriver(delivery.id, driverUserId, {
            allowOffline: true,
        });
        if (!assigned) return null;

        const order = await this.orderClient.getOrder(orderId);
        await publishDeliveryAssigned({
            delivery_id: assigned.id,
            order_id: orderId,
            user_id: order?.user_id ?? 0,
            driver_user_id: parseInt(driverUserId, 10),
        });

        return assigned;
    }

    async listDeliveries(): Promise<Delivery[]> {
        return this.deliveryRepository.find({
            order: { createdAt: "DESC" },
        });
    }

    async getDeliveriesByDriver(driverUserId: number): Promise<Delivery[]> {
        return await this.deliveryRepository.find({
            where: { driverId: driverUserId },
        });
    }

    async getActiveDeliveries(): Promise<Delivery[]> {
        return await this.deliveryRepository.find({
            where: {
                status: DeliveryStatus.IN_TRANSIT,
            },
        });
    }
}
