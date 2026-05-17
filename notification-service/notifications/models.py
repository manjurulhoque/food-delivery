from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class ChannelType(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"


@dataclass
class NotificationMessage:
    """Channel-agnostic notification payload."""

    subject: str
    body: str
    html: str | None = None
    recipient_email: str | None = None
    recipient_phone: str | None = None
    recipient_push_token: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class ChannelResult:
    channel: ChannelType
    success: bool
    detail: str = ""
