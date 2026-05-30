import { Kafka, Producer } from "kafkajs";

import type { DeliveryAssignedEvent } from "../types/kafka";
import { TOPIC_DELIVERY_ASSIGNED } from "./topics";

let producer: Producer | null = null;

function getProducer(): Producer {
    if (!producer) {
        const kafka = new Kafka({
            clientId: process.env.KAFKA_CLIENT_ID || "delivery-service",
            brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS || "kafka:9092"],
        });
        producer = kafka.producer();
    }
    return producer;
}

export async function connectProducer(): Promise<void> {
    await getProducer().connect();
}

export async function publishDeliveryAssigned(
    event: DeliveryAssignedEvent
): Promise<void> {
    await getProducer().send({
        topic: TOPIC_DELIVERY_ASSIGNED,
        messages: [{ value: JSON.stringify(event) }],
    });
}

export async function disconnectProducer(): Promise<void> {
    if (producer) {
        await producer.disconnect();
        producer = null;
    }
}
