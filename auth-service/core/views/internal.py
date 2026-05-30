from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from ..serializers import UserSerializer

User = get_user_model()


@api_view(["GET"])
@permission_classes([AllowAny])
def list_driver_users(request):
    """Internal: list auth users with is_driver=True (for delivery-service seed/sync)."""
    users = User.objects.filter(is_driver=True).order_by("id")
    return Response({"data": UserSerializer(users, many=True).data})


@api_view(["GET"])
@permission_classes([AllowAny])
def get_user_internal(request, user_id):
    """Internal: fetch user by id for service-to-service calls."""
    user = User.objects.filter(id=user_id).first()
    if user is None:
        return Response(
            {"data": {"user": None}, "error": "User not found"},
            status=status.HTTP_404_NOT_FOUND,
        )
    return Response({"data": {"user": UserSerializer(user).data}})
