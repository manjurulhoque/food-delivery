import requests
from django.http import JsonResponse
from functools import wraps
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def is_superuser_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        # Get the token from the Authorization header
        auth_header = request.META.get("HTTP_AUTHORIZATION", None)
        if auth_header is None or not auth_header.startswith("Bearer "):
            return JsonResponse(
                {
                    "success": False,
                    "message": "Authorization header missing or invalid.",
                },
                status=401,
            )

        token = auth_header.split(" ")[1]

        try:
            logger.error(
                f"Attempting to connect to: {settings.AUTH_SERVICE_URL}/verify"
            )
            # Add timeout to prevent hanging
            response = requests.post(
                f"{settings.AUTH_SERVICE_URL}/verify/",
                headers={"Authorization": f"Bearer {token}"},
                timeout=5,  # 5 second timeout
            )
            response_data = response.json()
            logger.info(f"Auth service response: {response_data}")

        except requests.exceptions.ConnectionError as e:
            logger.error(f"Connection error to auth service: {str(e)}")
            return JsonResponse(
                {
                    "success": False,
                    "message": "Unable to connect to authentication service. Please try again later.",
                },
                status=503,
            )
        except requests.exceptions.Timeout:
            logger.error("Auth service request timed out")
            return JsonResponse(
                {
                    "success": False,
                    "message": "Authentication service timed out. Please try again later.",
                },
                status=503,
            )
        except requests.exceptions.RequestException as e:
            logger.error(f"Auth service request failed: {str(e)}")
            return JsonResponse(
                {"success": False, "message": "Authentication service is unavailable."},
                status=503,
            )

        if response.status_code != 200 or not response_data.get("data", {}).get(
            "user", {}
        ).get("is_superuser"):
            return JsonResponse(
                {
                    "success": False,
                    "message": "You are not authorized to perform this action.",
                },
                status=403,
            )

        return view_func(request, *args, **kwargs)

    return _wrapped_view
