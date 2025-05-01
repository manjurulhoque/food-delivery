from django.core.management.base import BaseCommand
from kafka import KafkaConsumer, KafkaProducer
import json
import logging

# Kafka producer configuration
producer = KafkaProducer(
    bootstrap_servers='kafka:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
    api_version=(0, 10, 1)
)

# Configure logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Silence all Kafka-related logs
logging.getLogger('kafka').setLevel(logging.INFO)
logging.getLogger('kafka.conn').setLevel(logging.INFO)
logging.getLogger('kafka.client').setLevel(logging.INFO)
logging.getLogger('kafka.cluster').setLevel(logging.INFO)
logging.getLogger('kafka.consumer').setLevel(logging.INFO)
logging.getLogger('kafka.consumer.group').setLevel(logging.INFO)
logging.getLogger('kafka.coordinator').setLevel(logging.INFO)
logging.getLogger('kafka.protocol').setLevel(logging.INFO)
logging.getLogger('kafka.producer').setLevel(logging.INFO)

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Consume Kafka events from the order_placed topic'

    def handle(self, *args, **kwargs):
        logger.info('Consuming order events...')
        consumer = KafkaConsumer(
            'order.placed',
            bootstrap_servers=['kafka:9092'],
            value_deserializer=lambda x: json.loads(x.decode('utf-8'))
        )

        for message in consumer:
            event_data = message.value
            logger.info(f"Consumed event: {event_data}")
            # Emit the 'order.confirmed' event to Kafka
            # producer.send('order.confirmed', {
            #     'order_id': event_data['order_id'],
            #     'restaurant_id': event_data['restaurant_id']
            # })
            # # Create a restaurant order
            # try:
            #     RestaurantOrder.objects.create(
            #         order_id=event_data['order_id'],
            #         restaurant_id=event_data['restaurant_id'],
            #     )
            # except Exception as e:
            #     logger.error(f"Failed to create order: {e}")
            #     continue
            # logger.info(f"Restaurant confirmed order {event_data['order_id']}")
