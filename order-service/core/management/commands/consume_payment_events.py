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


def create_consumer():
    return KafkaConsumer(
        "payment.completed",
        "payment.failed",
        bootstrap_servers=["kafka:9092"],
        value_deserializer=lambda x: json.loads(x.decode("utf-8")),
        auto_offset_reset="latest",
        enable_auto_commit=True,
        group_id="order-service-payment-group",
        api_version_auto_timeout_ms=30000,
    )


class Command(BaseCommand):
    help = "Consume payment.completed and payment.failed Kafka events"

    def handle(self, *args, **kwargs):
        logger.info("Consuming payment events...")
        consumer = None

        while True:
            try:
                if consumer is None:
                    consumer = create_consumer()

                for message in consumer:
                    event_data = message.value
                    topic = message.topic
                    logger.info("Consumed %s: %s", topic, event_data)

                    order_id = event_data.get("order_id")
                    if not order_id:
                        logger.warning("Missing order_id in event")
                        continue

                    order = Order.objects.filter(id=order_id).first()
                    if not order:
                        logger.warning("Order %s not found", order_id)
                        continue

                    if topic == "payment.completed":
                        if order.status == OrderStatus.PENDING:
                            order.status = OrderStatus.PAID
                            order.save(update_fields=["status"])
                            logger.info("Order %s marked PAID", order_id)
                        else:
                            logger.info(
                                "Order %s skip PAID (status=%s)", order_id, order.status
                            )

                    elif topic == "payment.failed":
                        if order.status == OrderStatus.PENDING:
                            order.status = OrderStatus.CANCELED
                            order.save(update_fields=["status"])
                            logger.info("Order %s marked CANCELED (payment failed)", order_id)
                        else:
                            logger.info(
                                "Order %s skip CANCELED (status=%s)",
                                order_id,
                                order.status,
                            )

            except NoBrokersAvailable:
                logger.warning("Kafka not ready yet, retrying in 5s...")
                time.sleep(5)
                consumer = None

            except Exception as e:
                logger.error("Consumer crashed: %s", e)
                time.sleep(5)
                consumer = None
