import { api, ORDER_BASE_URL } from "@/lib/services/api";

export type CreateOrderItemPayload = {
    menu_id: number;
    quantity: number;
};

export type CreateOrderPayload = {
    restaurant_id: number;
    total_price: number;
    items: CreateOrderItemPayload[];
    accessToken?: string;
};

export type CreateOrderResponse = {
    order_id: number;
    success: boolean;
};

export type UpdateOrderPayload = {
    order_id: number;
    status: string;
    restaurant_id: number;
    accessToken?: string;
};

export type UpdateOrderResponse = {
    message: string;
};

export const orderApi = api.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        createOrder: builder.mutation<CreateOrderResponse, CreateOrderPayload>({
            query: ({ accessToken, ...payload }) => ({
                url: `${ORDER_BASE_URL}/create-order/`,
                method: "POST",
                body: payload,
                headers: accessToken
                    ? { Authorization: `Bearer ${accessToken}` }
                    : undefined,
            }),
            invalidatesTags: ["Order"],
        }),
        updateOrder: builder.mutation<UpdateOrderResponse, UpdateOrderPayload>({
            query: ({ accessToken, ...payload }) => ({
                url: `${ORDER_BASE_URL}/update-order/`,
                method: "POST",
                body: payload,
                headers: accessToken
                    ? { Authorization: `Bearer ${accessToken}` }
                    : undefined,
            }),
            invalidatesTags: ["Order"],
        }),
    }),
});

export const { useCreateOrderMutation, useUpdateOrderMutation } = orderApi;
