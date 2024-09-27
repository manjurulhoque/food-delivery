from kafka import KafkaProducer
import json
from .models import Order, OrderItem
from rest_framework.views import APIView
from rest_framework.response import Response

# Kafka producer configuration
producer = KafkaProducer(
    bootstrap_servers='localhost:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)


class CreateOrderView(APIView):
    def post(self, request):
        data = request.data
        # Create Order
        order = Order.objects.create(
            user_id=data['user_id'],
            restaurant_id=data['restaurant_id'],
            total_price=data['total_price'],
            status='Pending'
        )
        # Create associated OrderItems
        for item in data['items']:
            OrderItem.objects.create(order=order, item_name=item['item_name'], quantity=item['quantity'])

        # Emit the 'order_placed' event to Kafka
        producer.send('order_placed', {
            'order_id': order.id,
            'user_id': order.user_id,
            'restaurant_id': order.restaurant_id,
            'total_price': order.total_price,
            'items': [{'item_name': item.item_name, 'quantity': item.quantity} for item in order.items.all()]
        })

        # Return response
        return Response({"order_id": order.id, "status": "Order placed successfully"})
