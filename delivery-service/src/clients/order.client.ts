import axios from "axios";
import logger from "../config/logger";

export type OrderSummary = {
    id: number;
    user_id: number;
    restaurant_id: number;
    status: string;
    total_price: number;
};

export class OrderClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl =
            process.env.ORDER_SERVICE_URL || "http://order-service:5002";
    }

    async getOrder(orderId: number): Promise<OrderSummary | null> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/internal/orders/${orderId}/`,
            );
            return response.data?.data?.order ?? null;
        } catch (error) {
            logger.error(`Failed to fetch order ${orderId}:`, error);
            return null;
        }
    }
}
