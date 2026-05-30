import requests
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response


def _get_bearer_token(request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    return auth_header.split(" ")[1]


def verify_superuser(request):
    """
    Returns (user_dict, error_response).
    user_dict is the auth user payload when the caller is a superuser.
    """
    token = _get_bearer_token(request)
    if not token:
        return None, Response(
            {"error": "No valid token provided"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    try:
        response = requests.post(
            f"{settings.AUTH_SERVICE_URL}/verify/",
            headers={"Authorization": f"Bearer {token}"},
            timeout=5,
        )
        payload = response.json()
    except requests.RequestException:
        return None, Response(
            {"error": "Authentication service unavailable"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    if response.status_code != status.HTTP_200_OK:
        return None, Response(
            {"error": "Invalid token"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    user = payload.get("data", {}).get("user")
    if not user or not user.get("is_superuser"):
        return None, Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN,
        )

    return user, None
