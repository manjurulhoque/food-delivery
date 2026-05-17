import logging

import httpx

from config import get_settings
from notifications.channels.base import NotificationChannel
from notifications.models import ChannelResult, ChannelType, NotificationMessage

logger = logging.getLogger(__name__)

FCM_URL = "https://fcm.googleapis.com/fcm/send"


class PushChannel(NotificationChannel):
    """Push via Firebase Cloud Messaging legacy HTTP API."""

    @property
    def channel_type(self) -> ChannelType:
        return ChannelType.PUSH

    def is_enabled(self) -> bool:
        settings = get_settings()
        return bool(settings.PUSH_ENABLED and settings.FCM_SERVER_KEY)

    async def send(self, message: NotificationMessage) -> ChannelResult:
        if not message.recipient_push_token:
            return ChannelResult(
                channel=ChannelType.PUSH,
                success=False,
                detail="missing recipient_push_token",
            )

        settings = get_settings()
        payload = {
            "to": message.recipient_push_token,
            "notification": {
                "title": message.subject,
                "body": message.body,
            },
            "data": message.metadata,
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    FCM_URL,
                    headers={
                        "Authorization": f"key={settings.FCM_SERVER_KEY}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )

            if response.status_code == 200:
                body = response.json()
                if body.get("success", 0) >= 1:
                    logger.info("push_sent token=%s…", message.recipient_push_token[:12])
                    return ChannelResult(channel=ChannelType.PUSH, success=True)

            logger.error("push_send_failed status=%s body=%s", response.status_code, response.text)
            return ChannelResult(
                channel=ChannelType.PUSH,
                success=False,
                detail=response.text,
            )
        except Exception as exc:
            logger.exception("push_send_error: %s", exc)
            return ChannelResult(channel=ChannelType.PUSH, success=False, detail=str(exc))
