import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "http://localhost:7000";
export const AUTH_BASE_URL = `${API_GATEWAY_URL}/api/auth`;
export const RESTAURANT_BASE_URL = `${API_GATEWAY_URL}/api/restaurants`;

export const api = createApi({
    reducerPath: "foodyApi",
    baseQuery: fetchBaseQuery({
        baseUrl: API_GATEWAY_URL,
    }),
    tagTypes: ["Auth", "Menu", "Restaurant"],
    endpoints: () => ({}),
});
