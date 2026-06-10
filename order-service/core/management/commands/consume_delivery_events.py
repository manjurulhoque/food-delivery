from django.core.management.base import BaseCommand
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable
import json
import logging
import time

from core.models import Order, OrderStatus

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

DELIVERY_TO_ORDER_STATUS = {
    "DELIVERED": OrderStatus.DELIVERED,
    "CANCELLED": OrderStatus.CANCELED,
}


def create_consumer():
    return KafkaConsumer(
        "delivery.status.updated",
        bootstrap_servers=["kafka:9092"],
        value_deserializer=lambda x: json.loads(x.decode("utf-8")),
        auto_offset_reset="latest",
        enable_auto_commit=True,
        group_id="order-service-delivery-group",
        api_version_auto_timeout_ms=30000,
    )


class Command(BaseCommand):
    help = "Consume delivery.status.updated Kafka events and sync order status"

    def handle(self, *args, **kwargs):
        logger.info("Consuming delivery.status.updated events...")
        consumer = None

        while True:
            try:
                if consumer is None:
                    consumer = create_consumer()

                for message in consumer:
                    event = message.value
                    logger.info("Consumed delivery.status.updated: %s", event)

                    order_id = event.get("order_id")
                    delivery_status = event.get("status")

                    if not order_id or not delivery_status:
                        logger.warning("Missing order_id or status in event")
                        continue

                    order_status = DELIVERY_TO_ORDER_STATUS.get(delivery_status)
                    if order_status is None:
                        logger.info(
                            "No order status mapping for delivery status %s, skipping",
                            delivery_status,
                        )
                        continue

                    order = Order.objects.filter(id=order_id).first()
                    if not order:
                        logger.warning("Order %s not found", order_id)
                        continue

                    if order.status == order_status:
                        logger.info(
                            "Order %s already %s, no change",
                            order_id,
                            order_status,
                        )
                        continue

                    order.status = order_status
                    order.save(update_fields=["status"])
                    logger.info(
                        "Order %s status updated to %s (from delivery %s)",
                        order_id,
                        order_status,
                        delivery_status,
                    )

            except NoBrokersAvailable:
                logger.warning("Kafka not ready yet, retrying in 5s...")
                time.sleep(5)
                consumer = None

            except Exception as e:
                logger.error("Consumer crashed: %s", e)
                time.sleep(5)
                consumer = None
