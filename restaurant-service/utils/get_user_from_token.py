import jwt
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status

import logging

logger = logging.getLogger(__name__)


def get_user_id_from_token(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, Response({"error": "No valid token provided"}, status=status.HTTP_401_UNAUTHORIZED)

    token = auth_header.split(' ')[1]
    logger.info(f"Token retrieved from header: {token}")
    try:
        decoded_token = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,  # Make sure this matches the auth service secret key
            algorithms=['HS256']  # Use the same algorithm as auth service
        )
        logger.info(f"Access token successfully retrieved: {decoded_token}")
        return decoded_token.get('user_id'), None
    except Exception as e:
        logger.error(f"Error retrieving access token: {str(e)}")
        return None, Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
