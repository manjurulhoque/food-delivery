export type PaymentCompletedEvent = {
    payment_id: number;
    order_id: number;
    user_id: number;
    amount: number;
    currency: string;
};

export type DeliveryAssignedEvent = {
    delivery_id: string;
    order_id: number;
    user_id: number;
    driver_user_id: number;
};

export type DeliveryStatusUpdatedEvent = {
    delivery_id: string;
    order_id: number;
    status: string;
};
