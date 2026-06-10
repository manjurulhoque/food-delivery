import { Consumer, Kafka } from "kafkajs";

import { DeliveryService } from "../services/delivery.service";
import type { PaymentCompletedEvent } from "../types/kafka";
import { TOPIC_PAYMENT_COMPLETED } from "./topics";
import logger from "../config/logger";

let consumer: Consumer | null = null;

function parsePaymentCompleted(value: string): PaymentCompletedEvent | null {
    try {
        const parsed = JSON.parse(value) as PaymentCompletedEvent;
        if (!parsed.order_id) return null;
        return parsed;
    } catch {
        return null;
    }
}

export async function startPaymentCompletedConsumer(
    deliveryService: DeliveryService,
): Promise<void> {
    const kafka = new Kafka({
        clientId: process.env.KAFKA_CLIENT_ID || "delivery-service",
        brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS || "kafka:9092"],
    });

    consumer = kafka.consumer({
        groupId: process.env.KAFKA_GROUP_ID || "delivery-service-group",
    });

    await consumer.connect();
    await consumer.subscribe({
        topic: TOPIC_PAYMENT_COMPLETED,
        fromBeginning: false,
    });

    logger.info(`Kafka consumer subscribed to ${TOPIC_PAYMENT_COMPLETED}`);

    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            const raw = message.value?.toString();
            if (!raw) return;

            const event = parsePaymentCompleted(raw);
            if (!event) {
                logger.warn(`Invalid ${topic} payload: ${raw}`);
                return;
            }

            logger.info(`Received ${topic}: order_id=${event.order_id}`);
            try {
                await deliveryService.handlePaymentCompleted(event);
            } catch (error) {
                logger.error(
                    `Failed to handle payment.completed for order ${event.order_id}:`,
                    error,
                );
            }
        },
    });
}

export async function stopPaymentCompletedConsumer(): Promise<void> {
    if (consumer) {
        await consumer.disconnect();
        consumer = null;
    }
}
