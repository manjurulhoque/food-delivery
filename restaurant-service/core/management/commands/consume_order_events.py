from django.core.management.base import BaseCommand
from kafka import KafkaConsumer, KafkaProducer
import json
from core.models import RestaurantOrder, Restaurant

# Kafka producer configuration
producer = KafkaProducer(
    bootstrap_servers='kafka:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
    api_version=(0, 10, 1)
)


class Command(BaseCommand):
    help = 'Consume Kafka events from the order_placed topic'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Consuming order events...'))
        consumer = KafkaConsumer(
            'order_placed',
            bootstrap_servers=['kafka:9092'],
            value_deserializer=lambda x: json.loads(x.decode('utf-8'))
        )

        for message in consumer:
            event_data = message.value
            print(f"Consumed event: {event_data}")
            # Emit the 'order_confirmed' event to Kafka
            producer.send('order_confirmed', {
                'order_id': event_data['order_id'],
                'restaurant_id': event_data['restaurant_id']
            })
            # Create a restaurant order
            try:
                RestaurantOrder.objects.create(
                    order_id=event_data['order_id'],
                    restaurant_id=event_data['restaurant_id'],
                )
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to create order: {e}"))
                continue
            self.stdout.write(self.style.SUCCESS(f"Restaurant confirmed order {event_data['order_id']}"))
