from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from core.models import Order


@api_view(["GET"])
@permission_classes([AllowAny])
def get_order_internal(request, order_id):
    """Internal: fetch order by id for service-to-service calls."""
    order = Order.objects.filter(id=order_id).first()
    if order is None:
        return Response(
            {"data": {"order": None}, "error": "Order not found"},
            status=status.HTTP_404_NOT_FOUND,
        )
    return Response(
        {
            "data": {
                "order": {
                    "id": order.id,
                    "user_id": order.user_id,
                    "restaurant_id": order.restaurant_id,
                    "status": order.status,
                    "total_price": order.total_price,
                }
            }
        }
    )

