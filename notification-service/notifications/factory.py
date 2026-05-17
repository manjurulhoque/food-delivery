from functools import lru_cache

from notifications.channels.base import NotificationChannel
from notifications.channels.email import EmailChannel
from notifications.channels.push import PushChannel
from notifications.channels.sms import SmsChannel
from notifications.models import ChannelType


class ChannelFactory:
    """Factory — creates channel strategies by type."""

    _registry: dict[ChannelType, type[NotificationChannel]] = {
        ChannelType.EMAIL: EmailChannel,
        ChannelType.SMS: SmsChannel,
        ChannelType.PUSH: PushChannel,
    }

    @classmethod
    def create(cls, channel_type: ChannelType) -> NotificationChannel:
        channel_cls = cls._registry.get(channel_type)
        if channel_cls is None:
            raise ValueError(f"Unknown channel type: {channel_type}")
        return channel_cls()

    @classmethod
    def create_all_enabled(cls) -> list[NotificationChannel]:
        channels: list[NotificationChannel] = []
        for channel_type in ChannelType:
            channel = cls.create(channel_type)
            if channel.is_enabled():
                channels.append(channel)
        return channels


@lru_cache
def get_default_channels() -> tuple[NotificationChannel, ...]:
    return tuple(ChannelFactory.create_all_enabled())
