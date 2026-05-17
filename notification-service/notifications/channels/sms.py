import logging

import httpx

from config import get_settings
from notifications.channels.base import NotificationChannel
from notifications.models import ChannelResult, ChannelType, NotificationMessage

logger = logging.getLogger(__name__)


class SmsChannel(NotificationChannel):
    """SMS via Twilio REST API (configure in .env)."""

    @property
    def channel_type(self) -> ChannelType:
        return ChannelType.SMS

    def is_enabled(self) -> bool:
        settings = get_settings()
        return bool(
            settings.SMS_ENABLED
            and settings.TWILIO_ACCOUNT_SID
            and settings.TWILIO_AUTH_TOKEN
            and settings.TWILIO_FROM_NUMBER
        )

    async def send(self, message: NotificationMessage) -> ChannelResult:
        if not message.recipient_phone:
            return ChannelResult(
                channel=ChannelType.SMS,
                success=False,
                detail="missing recipient_phone",
            )

        settings = get_settings()
        url = (
            f"https://api.twilio.com/2010-04-01/Accounts/"
            f"{settings.TWILIO_ACCOUNT_SID}/Messages.json"
        )

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    url,
                    auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN),
                    data={
                        "From": settings.TWILIO_FROM_NUMBER,
                        "To": message.recipient_phone,
                        "Body": message.body,
                    },
                )

            if response.status_code in (200, 201):
                logger.info("sms_sent to=%s", message.recipient_phone)
                return ChannelResult(channel=ChannelType.SMS, success=True)

            logger.error("sms_send_failed status=%s body=%s", response.status_code, response.text)
            return ChannelResult(
                channel=ChannelType.SMS,
                success=False,
                detail=response.text,
            )
        except Exception as exc:
            logger.exception("sms_send_error: %s", exc)
            return ChannelResult(channel=ChannelType.SMS, success=False, detail=str(exc))
