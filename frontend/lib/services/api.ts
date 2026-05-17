import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

export const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "http://localhost:7000";
export const AUTH_BASE_URL = `${API_GATEWAY_URL}/api/auth`;
export const RESTAURANT_BASE_URL = `${API_GATEWAY_URL}/api/restaurants`;
export const ORDER_BASE_URL = `${API_GATEWAY_URL}/api/orders`;
export const DELIVERY_BASE_URL = `${API_GATEWAY_URL}/api/deliveries`;

export const api = createApi({
    reducerPath: "foodyApi",
    baseQuery: fetchBaseQuery({
        baseUrl: API_GATEWAY_URL,
        prepareHeaders: async (headers, api) => {
            const session = await getSession();
            if (session?.accessToken) {
                headers.set("Authorization", `Bearer ${session.accessToken}`);
            }
            return headers;
        },
    }),
    tagTypes: ["Auth", "Menu", "Restaurant", "Order", "Delivery"],
    endpoints: () => ({}),
});
