import requests
from django.http import JsonResponse
from functools import wraps
from django.conf import settings
import structlog
from rest_framework import status

logger = structlog.get_logger("restaurant-service")


def _get_bearer_token(request):
    auth_header = request.META.get("HTTP_AUTHORIZATION", None)
    if auth_header is None or not auth_header.startswith("Bearer "):
        return None
    return auth_header.split(" ")[1]


def is_superuser_token(token):
    if not token:
        return False

    try:
        response = requests.post(
            f"{settings.AUTH_SERVICE_URL}/verify/",
            headers={"Authorization": f"Bearer {token}"},
            timeout=5,
        )
        response_data = response.json()
    except requests.exceptions.RequestException:
        return False

    if response.status_code != 200:
        return False

    return bool(response_data.get("data", {}).get("user", {}).get("is_superuser"))


def has_owner_or_superuser_access(request, owner_user_id, request_user_id):
    return bool(request_user_id == owner_user_id or is_superuser_token(_get_bearer_token(request)))


def is_superuser_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        # Get the token from the Authorization header
        token = _get_bearer_token(request)
        if token is None:
            return JsonResponse(
                {
                    "success": False,
                    "message": "Authorization header missing or invalid.",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            logger.info(
                f"Attempting to connect to: {settings.AUTH_SERVICE_URL}/verify"
            )
            # Add timeout to prevent hanging
            response = requests.post(
                f"{settings.AUTH_SERVICE_URL}/verify/",
                headers={"Authorization": f"Bearer {token}"},
                timeout=5,  # 5 second timeout
            )
            response_data = response.json()
            logger.info("Auth service response", response=response_data)

        except requests.exceptions.ConnectionError as e:
            logger.error("Connection error to auth service", error=str(e))
            return JsonResponse(
                {
                    "success": False,
                    "message": "Unable to connect to authentication service. Please try again later.",
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except requests.exceptions.Timeout:
            logger.error("Auth service request timed out", error="Timeout")
            return JsonResponse(
                {
                    "success": False,
                    "message": "Authentication service timed out. Please try again later.",
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except requests.exceptions.RequestException as e:
            logger.error("Auth service request failed", error=str(e))
            return JsonResponse(
                {"success": False, "message": "Authentication service is unavailable."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if response.status_code != 200 or not response_data.get("data", {}).get(
            "user", {}
        ).get("is_superuser"):
            logger.error("User is not authorized to perform this action")
            return JsonResponse(
                {
                    "success": False,
                    "message": "You are not authorized to perform this action.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        logger.info("User is authorized to perform this action")
        return view_func(request, *args, **kwargs)

    return _wrapped_view
