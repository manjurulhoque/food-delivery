import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib

from config import get_settings

logger = logging.getLogger(__name__)


async def send_email(*, to: str, subject: str, html: str) -> bool:
    """Send HTML email via SMTP (Mailtrap)."""
    settings = get_settings()

    if not settings.EMAIL_ENABLED:
        logger.info("Email disabled, skipping send to %s", to)
        return False

    if not settings.SMTP_HOST:
        logger.warning("SMTP_HOST not set, skipping email to %s", to)
        return False

    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("SMTP_USER/SMTP_PASSWORD not set, skipping email to %s", to)
        return False

    if not settings.SMTP_FROM_EMAIL:
        logger.warning("SMTP_FROM_EMAIL not set, skipping email to %s", to)
        return False

    message = MIMEMultipart("alternative")
    message["From"] = settings.SMTP_FROM_EMAIL
    message["To"] = to
    message["Subject"] = subject
    message.attach(MIMEText(html, "html", "utf-8"))

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=settings.SMTP_STARTTLS,
            use_tls=settings.SMTP_USE_SSL,
        )
        logger.info("Email sent to %s — %s", to, subject)
        return True
    except Exception as exc:
        logger.exception("email_send_error: %s", exc)
        return False


async def send_order_placed_email(*, to: str, order_id: int, total_price: float) -> bool:
    subject = f"Order #{order_id} confirmed"
    html = f"""
    <h2>Thanks for your order!</h2>
    <p>Your order <strong>#{order_id}</strong> has been placed successfully.</p>
    <p>Total: <strong>${total_price:.2f}</strong></p>
    <p>We will notify you when the restaurant starts preparing it.</p>
  """
    return await send_email(to=to, subject=subject, html=html)


async def send_payment_failed_email(
    *, to: str, order_id: int, reason: str
) -> bool:
    subject = f"Payment failed for order #{order_id}"
    html = f"""
    <h2>Payment could not be completed</h2>
    <p>We could not process payment for order <strong>#{order_id}</strong>.</p>
    <p>Reason: {reason}</p>
    <p>Please try again from your cart or choose another payment method.</p>
  """
    return await send_email(to=to, subject=subject, html=html)


async def send_welcome_email(*, to: str) -> bool:
    subject = "Welcome to Foody"
    html = """
    <h2>Welcome to Foody!</h2>
    <p>Your account is ready. Browse restaurants and order your favorite meals.</p>
  """
    return await send_email(to=to, subject=subject, html=html)
