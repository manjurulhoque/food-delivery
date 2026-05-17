"""Event-specific notification content (templates) + dispatch."""

from typing import Any

from notifications.dispatcher import get_dispatcher
from notifications.models import ChannelType, NotificationMessage
from users import user_email, user_phone, user_push_token


def _message_from_user(
    user: dict | None,
    *,
    subject: str,
    body: str,
    html: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> NotificationMessage:
    return NotificationMessage(
        subject=subject,
        body=body,
        html=html or f"<p>{body}</p>",
        recipient_email=user_email(user),
        recipient_phone=user_phone(user),
        recipient_push_token=user_push_token(user),
        metadata=metadata or {},
    )


async def notify_order_placed(
    user: dict | None,
    *,
    order_id: int,
    total_price: float,
) -> None:
    subject = f"Order #{order_id} confirmed"
    body = (
        f"Your order #{order_id} was placed successfully. "
        f"Total: ${total_price:.2f}. We'll notify you when preparation starts."
    )
    html = f"""
    <h2>Thanks for your order!</h2>
    <p>Your order <strong>#{order_id}</strong> has been placed successfully.</p>
    <p>Total: <strong>${total_price:.2f}</strong></p>
    <p>We will notify you when the restaurant starts preparing it.</p>
    """
    message = _message_from_user(
        user,
        subject=subject,
        body=body,
        html=html,
        metadata={"event": "order.placed", "order_id": order_id},
    )
    await get_dispatcher().dispatch(
        message,
        channels=[ChannelType.EMAIL, ChannelType.SMS, ChannelType.PUSH],
    )


async def notify_payment_failed(
    user: dict | None,
    *,
    order_id: int,
    reason: str,
) -> None:
    subject = f"Payment failed for order #{order_id}"
    body = f"Payment for order #{order_id} failed: {reason}. Please try again."
    html = f"""
    <h2>Payment could not be completed</h2>
    <p>We could not process payment for order <strong>#{order_id}</strong>.</p>
    <p>Reason: {reason}</p>
    <p>Please try again from your cart or choose another payment method.</p>
    """
    message = _message_from_user(
        user,
        subject=subject,
        body=body,
        html=html,
        metadata={"event": "payment.failed", "order_id": order_id},
    )
    await get_dispatcher().dispatch(
        message,
        channels=[ChannelType.EMAIL, ChannelType.SMS, ChannelType.PUSH],
    )


async def notify_user_registered(user: dict | None) -> None:
    subject = "Welcome to Foody"
    body = "Your account is ready. Browse restaurants and order your favorite meals."
    html = """
    <h2>Welcome to Foody!</h2>
    <p>Your account is ready. Browse restaurants and order your favorite meals.</p>
    """
    message = _message_from_user(
        user,
        subject=subject,
        body=body,
        html=html,
        metadata={"event": "user.registered"},
    )
    await get_dispatcher().dispatch(
        message,
        channels=[ChannelType.EMAIL, ChannelType.SMS, ChannelType.PUSH],
    )
