import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib

from config import get_settings
from notifications.channels.base import NotificationChannel
from notifications.models import ChannelResult, ChannelType, NotificationMessage

logger = logging.getLogger(__name__)


class EmailChannel(NotificationChannel):
    @property
    def channel_type(self) -> ChannelType:
        return ChannelType.EMAIL

    def is_enabled(self) -> bool:
        settings = get_settings()
        return bool(
            settings.EMAIL_ENABLED
            and settings.SMTP_HOST
            and settings.SMTP_USER
            and settings.SMTP_PASSWORD
            and settings.SMTP_FROM_EMAIL
        )

    async def send(self, message: NotificationMessage) -> ChannelResult:
        if not message.recipient_email:
            return ChannelResult(
                channel=ChannelType.EMAIL,
                success=False,
                detail="missing recipient_email",
            )

        settings = get_settings()
        mime = MIMEMultipart("alternative")
        mime["From"] = settings.SMTP_FROM_EMAIL
        mime["To"] = message.recipient_email
        mime["Subject"] = message.subject
        mime.attach(MIMEText(message.html or message.body, "html", "utf-8"))

        try:
            await aiosmtplib.send(
                mime,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
                start_tls=settings.SMTP_STARTTLS,
                use_tls=settings.SMTP_USE_SSL,
            )
            logger.info("email_sent to=%s subject=%s", message.recipient_email, message.subject)
            return ChannelResult(channel=ChannelType.EMAIL, success=True)
        except Exception as exc:
            logger.exception("email_send_error: %s", exc)
            return ChannelResult(channel=ChannelType.EMAIL, success=False, detail=str(exc))
