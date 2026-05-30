import axios from "axios";

export type RestaurantSummary = {
    id: number;
    name: string;
    address: string;
    phone: string;
    user_id: number;
};

export class RestaurantClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl =
            process.env.RESTAURANT_SERVICE_URL || "http://restaurant-service:5001";
    }

    async getRestaurant(restaurantId: number): Promise<RestaurantSummary | null> {
        try {
            const response = await axios.get(`${this.baseUrl}/${restaurantId}/`);
            return response.data?.data ?? null;
        } catch (error) {
            console.error(`Failed to fetch restaurant ${restaurantId}:`, error);
            return null;
        }
    }
}
