from kafka import KafkaProducer
import json
from .models import Order, OrderItem, OrderStatus
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.http import JsonResponse

from utils.get_user_from_token import get_user_id_from_token


# Kafka producer configuration
producer = KafkaProducer(
    bootstrap_servers='kafka:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
    api_version=(0, 10, 1)
)


def home(request):
    return JsonResponse({'message': 'Hello, World!'})


class CreateOrderView(APIView):
    def post(self, request):
        user_id, error_response = get_user_id_from_token(request)
        if error_response:
            return error_response
        
        data = request.data
        with transaction.atomic():
            # Create Order
            order = Order.objects.create(
                user_id=user_id,
                restaurant_id=data['restaurant_id'],
                total_price=data['total_price'],
                status=OrderStatus.PENDING
            )
            # Create associated OrderItems
            for item in data['items']:
                OrderItem.objects.create(order=order, menu_id=item['menu_id'], quantity=item['quantity'])

            # Emit the 'order_placed' event to Kafka
            producer.send('order.placed', {
                'order_id': order.id,
                'user_id': order.user_id,
                'restaurant_id': order.restaurant_id,
                'total_price': order.total_price,
                'items': [{'menu_id': item.menu_id, 'quantity': item.quantity} for item in order.items.all()]
            })

        # Return response
        return Response({"order_id": order.id, "success": True}, status=status.HTTP_201_CREATED)
