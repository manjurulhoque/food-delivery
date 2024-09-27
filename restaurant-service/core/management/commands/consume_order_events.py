from django.core.management.base import BaseCommand
from kafka import KafkaConsumer
import json
from core.models import RestaurantOrder


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
            # Create a restaurant order
            RestaurantOrder.objects.create(
                order_id=event_data['order_id'],
                restaurant_id=event_data['restaurant_id'],
            )
            self.stdout.write(self.style.SUCCESS(f"Restaurant confirmed order {event_data['order_id']}"))
