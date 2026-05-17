import { api, DELIVERY_BASE_URL } from "@/lib/services/api";
import type {
    AvailableDriver,
    Delivery,
    DeliveryLocation,
    DeliveryStatus,
} from "@/lib/types/delivery";

export type CreateDeliveryPayload = {
    orderId: string;
    pickupLocation: DeliveryLocation;
    deliveryLocation: DeliveryLocation;
    estimatedDeliveryTime: string;
};

export type UpdateDeliveryStatusPayload = {
    id: string;
    status: DeliveryStatus;
};

export type AssignDriverPayload = {
    id: string;
    driverId: string;
};

export type UpdateDriverLocationPayload = {
    driverId: string;
    location: DeliveryLocation;
};

export const deliveryApi = api.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getActiveDeliveries: builder.query<Delivery[], void>({
            query: () => ({
                url: `${DELIVERY_BASE_URL}/active`,
                method: "GET",
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: "Delivery" as const, id })),
                          { type: "Delivery", id: "ACTIVE_LIST" },
                      ]
                    : [{ type: "Delivery", id: "ACTIVE_LIST" }],
        }),
        getDeliveryById: builder.query<Delivery, string>({
            query: (id) => ({
                url: `${DELIVERY_BASE_URL}/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, id) => [{ type: "Delivery", id }],
        }),
        getAvailableDrivers: builder.query<AvailableDriver[], void>({
            query: () => ({
                url: `${DELIVERY_BASE_URL}/drivers/available`,
                method: "GET",
            }),
            providesTags: [{ type: "Delivery", id: "AVAILABLE_DRIVERS" }],
        }),
        createDelivery: builder.mutation<Delivery, CreateDeliveryPayload>({
            query: (body) => ({
                url: `${DELIVERY_BASE_URL}/`,
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Delivery", id: "ACTIVE_LIST" }],
        }),
        updateDeliveryStatus: builder.mutation<Delivery, UpdateDeliveryStatusPayload>({
            query: ({ id, status }) => ({
                url: `${DELIVERY_BASE_URL}/${id}/status`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Delivery", id },
                { type: "Delivery", id: "ACTIVE_LIST" },
            ],
        }),
        assignDriver: builder.mutation<Delivery, AssignDriverPayload>({
            query: ({ id, driverId }) => ({
                url: `${DELIVERY_BASE_URL}/${id}/assign`,
                method: "POST",
                body: { driverId },
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Delivery", id },
                { type: "Delivery", id: "ACTIVE_LIST" },
            ],
        }),
        updateDriverLocation: builder.mutation<{ success: boolean }, UpdateDriverLocationPayload>({
            query: ({ driverId, location }) => ({
                url: `${DELIVERY_BASE_URL}/drivers/${driverId}/location`,
                method: "PATCH",
                body: { location },
            }),
        }),
    }),
});

export const {
    useGetActiveDeliveriesQuery,
    useGetDeliveryByIdQuery,
    useGetAvailableDriversQuery,
    useCreateDeliveryMutation,
    useUpdateDeliveryStatusMutation,
    useAssignDriverMutation,
    useUpdateDriverLocationMutation,
} = deliveryApi;
