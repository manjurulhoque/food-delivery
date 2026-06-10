import { api, DELIVERY_BASE_URL } from "@/lib/services/api";
import type {
    Delivery,
    DeliveryLocation,
    DeliveryStatus,
} from "@/lib/types/delivery";
import type {
    CreateDriverProfilePayload,
    DriverProfile,
    UpdateDriverAvailabilityPayload,
} from "@/lib/types/driver";

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

export type AssignDriverToOrderPayload = {
    orderId: number;
    driverId: number;
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
        getDeliveries: builder.query<Delivery[], void>({
            query: () => ({
                url: `${DELIVERY_BASE_URL}/`,
                method: "GET",
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: "Delivery" as const, id })),
                          { type: "Delivery", id: "LIST" },
                      ]
                    : [{ type: "Delivery", id: "LIST" }],
        }),
        getDeliveryByOrderId: builder.query<Delivery, number>({
            query: (orderId) => ({
                url: `${DELIVERY_BASE_URL}/by-order/${orderId}`,
                method: "GET",
            }),
            providesTags: (_result, _error, orderId) => [
                { type: "Delivery", id: `ORDER_${orderId}` },
            ],
        }),
        getDeliveriesByDriver: builder.query<Delivery[], number>({
            query: (userId) => ({
                url: `${DELIVERY_BASE_URL}/driver/${userId}`,
                method: "GET",
            }),
            providesTags: (_result, _error, userId) => [
                { type: "Delivery", id: `DRIVER_DELIVERIES_${userId}` },
            ],
        }),
        getDeliveryById: builder.query<Delivery, string>({
            query: (id) => ({
                url: `${DELIVERY_BASE_URL}/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, id) => [{ type: "Delivery", id }],
        }),
        getDriverProfiles: builder.query<DriverProfile[], void>({
            query: () => ({
                url: `${DELIVERY_BASE_URL}/drivers`,
                method: "GET",
            }),
            providesTags: [{ type: "Delivery", id: "DRIVER_LIST" }],
        }),
        getAvailableDrivers: builder.query<DriverProfile[], void>({
            query: () => ({
                url: `${DELIVERY_BASE_URL}/drivers/available`,
                method: "GET",
            }),
            providesTags: [{ type: "Delivery", id: "AVAILABLE_DRIVERS" }],
        }),
        getDriverByUserId: builder.query<DriverProfile, number>({
            query: (userId) => ({
                url: `${DELIVERY_BASE_URL}/drivers/${userId}`,
                method: "GET",
            }),
            providesTags: (_result, _error, userId) => [
                { type: "Delivery", id: `DRIVER_${userId}` },
            ],
        }),
        createDelivery: builder.mutation<Delivery, CreateDeliveryPayload>({
            query: (body) => ({
                url: `${DELIVERY_BASE_URL}/`,
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Delivery", id: "ACTIVE_LIST" }],
        }),
        createDriverProfile: builder.mutation<DriverProfile, CreateDriverProfilePayload>({
            query: (body) => ({
                url: `${DELIVERY_BASE_URL}/drivers`,
                method: "POST",
                body,
            }),
            invalidatesTags: [
                { type: "Delivery", id: "DRIVER_LIST" },
                { type: "Delivery", id: "AVAILABLE_DRIVERS" },
            ],
        }),
        syncDriverProfiles: builder.mutation<{ created: number; skipped: number }, void>({
            query: () => ({
                url: `${DELIVERY_BASE_URL}/drivers/sync`,
                method: "POST",
            }),
            invalidatesTags: [
                { type: "Delivery", id: "DRIVER_LIST" },
                { type: "Delivery", id: "AVAILABLE_DRIVERS" },
            ],
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
                { type: "Delivery", id: "AVAILABLE_DRIVERS" },
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
                { type: "Delivery", id: "LIST" },
                { type: "Delivery", id: "AVAILABLE_DRIVERS" },
            ],
        }),
        assignDriverToOrder: builder.mutation<Delivery, AssignDriverToOrderPayload>({
            query: ({ orderId, driverId }) => ({
                url: `${DELIVERY_BASE_URL}/by-order/${orderId}/assign`,
                method: "POST",
                body: { driverId },
            }),
            invalidatesTags: (_result, _error, { orderId }) => [
                { type: "Delivery", id: "LIST" },
                { type: "Delivery", id: "ACTIVE_LIST" },
                { type: "Delivery", id: "AVAILABLE_DRIVERS" },
                { type: "Delivery", id: `ORDER_${orderId}` },
            ],
        }),
        updateDriverAvailability: builder.mutation<DriverProfile, UpdateDriverAvailabilityPayload>({
            query: ({ userId, isOnline }) => ({
                url: `${DELIVERY_BASE_URL}/drivers/${userId}/availability`,
                method: "PATCH",
                body: { isOnline },
            }),
            invalidatesTags: (_result, _error, { userId }) => [
                { type: "Delivery", id: `DRIVER_${userId}` },
                { type: "Delivery", id: "DRIVER_LIST" },
                { type: "Delivery", id: "AVAILABLE_DRIVERS" },
            ],
        }),
        updateDriverLocation: builder.mutation<DriverProfile, UpdateDriverLocationPayload>({
            query: ({ driverId, location }) => ({
                url: `${DELIVERY_BASE_URL}/drivers/${driverId}/location`,
                method: "PATCH",
                body: { location },
            }),
            invalidatesTags: (_result, _error, { driverId }) => [
                { type: "Delivery", id: `DRIVER_${driverId}` },
            ],
        }),
    }),
});

export const {
    useGetActiveDeliveriesQuery,
    useGetDeliveriesQuery,
    useGetDeliveryByIdQuery,
    useGetDeliveriesByDriverQuery,
    useGetDeliveryByOrderIdQuery,
    useGetDriverProfilesQuery,
    useGetAvailableDriversQuery,
    useGetDriverByUserIdQuery,
    useCreateDeliveryMutation,
    useCreateDriverProfileMutation,
    useSyncDriverProfilesMutation,
    useUpdateDeliveryStatusMutation,
    useAssignDriverMutation,
    useAssignDriverToOrderMutation,
    useUpdateDriverAvailabilityMutation,
    useUpdateDriverLocationMutation,
} = deliveryApi;
