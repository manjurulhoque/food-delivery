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
        auth_header = request.META.get('HTTP_AUTHORIZATION', None)
        if auth_header is None or not auth_header.startswith('Bearer '):
            return JsonResponse({"success": False, "message": "Authorization header missing or invalid."}, status=401)

        token = auth_header.split(' ')[1]

        try:
            # Call the Auth Service to verify the token
            response = requests.post(
                f"{settings.AUTH_SERVICE_URL}/verify/",
                headers={"Authorization": f"Bearer {token}"}
            )
            response_data = response.json()
            logger.info(response_data)

            if response.status_code != 200 or not response_data.get('data', {}).get('user', {}).get('is_superuser'):
                return JsonResponse({"success": False, "message": "User is not a superuser."}, status=403)

        except requests.exceptions.RequestException as e:
            logger.error(str(e))
            return JsonResponse({"success": False, "message": "Authentication service is unavailable."}, status=503)

        return view_func(request, *args, **kwargs)

    return _wrapped_view
