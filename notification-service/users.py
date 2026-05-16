import logging

import httpx

from config import get_settings

logger = logging.getLogger(__name__)


async def get_user_details(user_id: int | str | None) -> dict | None:
    """Fetch user from auth-service. Returns user dict with email, or None."""
    if user_id is None:
        return None

    settings = get_settings()
    url = f"{settings.AUTH_SERVICE_URL.rstrip('/')}/users/{user_id}/"

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url)

        if response.status_code != 200:
            logger.warning("auth_user_fetch_failed status=%s user_id=%s", response.status_code, user_id)
            return None

        body = response.json()
        user = body.get("data", {}).get("user") or body.get("user")
        if not user or not isinstance(user, dict):
            return None
        return user
    except Exception as exc:
        logger.exception("auth_user_fetch_error user_id=%s: %s", user_id, exc)
        return None


def user_email(user: dict | None) -> str | None:
    if not user:
        return None
    email = user.get("email")
    return email if isinstance(email, str) and "@" in email else None
