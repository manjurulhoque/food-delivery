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

export type CustomerOrderItem = {
    menu_id: number;
    quantity: number;
};

export type CustomerOrder = {
    id: number;
    user_id?: number;
    restaurant_id: number;
    total_price: number;
    status: string;
    created_at: string;
    items: CustomerOrderItem[];
};

export type AdminOrder = CustomerOrder & {
    user_id: number;
};

export type AdminOrdersResponse = {
    orders: AdminOrder[];
};

export type AdminUpdateOrderPayload = {
    orderId: number;
    status: string;
};

export type AdminUpdateOrderResponse = {
    order: AdminOrder;
    message: string;
};

export const ORDER_STATUSES = [
    "PENDING",
    "PAID",
    "CONFIRMED",
    "PREPARING",
    "CANCELED",
    "DELIVERED",
    "REFUNDED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type CustomerOrdersResponse = {
    orders: CustomerOrder[];
};

export const orderApi = api.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getMyOrders: builder.query<CustomerOrdersResponse, void>({
            query: () => ({
                url: `${ORDER_BASE_URL}/my-orders/`,
                method: "GET",
            }),
            providesTags: ["Order"],
        }),
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
        getAdminOrders: builder.query<AdminOrdersResponse, void>({
            query: () => ({
                url: `${ORDER_BASE_URL}/admin/orders/`,
                method: "GET",
            }),
            providesTags: ["Order"],
        }),
        adminUpdateOrder: builder.mutation<AdminUpdateOrderResponse, AdminUpdateOrderPayload>({
            query: ({ orderId, status }) => ({
                url: `${ORDER_BASE_URL}/admin/orders/${orderId}/`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: ["Order"],
        }),
    }),
});

export const {
    useGetMyOrdersQuery,
    useCreateOrderMutation,
    useUpdateOrderMutation,
    useGetAdminOrdersQuery,
    useAdminUpdateOrderMutation,
} = orderApi;
