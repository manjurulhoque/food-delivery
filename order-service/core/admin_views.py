from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import Order, OrderStatus
from utils.auth import verify_superuser


def serialize_order(order):
    return {
        "id": order.id,
        "user_id": order.user_id,
        "restaurant_id": order.restaurant_id,
        "total_price": order.total_price,
        "status": order.status,
        "created_at": order.created_at.isoformat(),
        "items": [
            {"menu_id": item.menu_id, "quantity": item.quantity}
            for item in order.items.all()
        ],
    }


class AdminOrdersListView(APIView):
    """Admin: list all orders with status."""

    def get(self, request):
        _, error_response = verify_superuser(request)
        if error_response:
            return error_response

        orders = Order.objects.prefetch_related("items").order_by("-created_at")
        return Response(
            {"orders": [serialize_order(order) for order in orders]},
            status=status.HTTP_200_OK,
        )


class AdminUpdateOrderView(APIView):
    """Admin: update order status."""

    def patch(self, request, order_id):
        _, error_response = verify_superuser(request)
        if error_response:
            return error_response

        order = Order.objects.filter(id=order_id).prefetch_related("items").first()
        if not order:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get("status")
        valid_statuses = {choice.value for choice in OrderStatus}
        if new_status not in valid_statuses:
            return Response(
                {"error": f"Invalid status. Allowed: {sorted(valid_statuses)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if order.status == new_status:
            return Response(
                {"order": serialize_order(order), "message": "No change"},
                status=status.HTTP_200_OK,
            )

        order.status = new_status
        order.save(update_fields=["status"])

        from core.views import producer

        producer.send(
            "order.updated",
            {"order_id": order.id, "status": order.status},
        )

        return Response(
            {"order": serialize_order(order), "message": "Order updated"},
            status=status.HTTP_200_OK,
        )
