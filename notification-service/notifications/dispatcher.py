import logging
from typing import Iterable

from notifications.channels.base import NotificationChannel
from notifications.factory import ChannelFactory, get_default_channels
from notifications.models import ChannelResult, ChannelType, NotificationMessage

logger = logging.getLogger(__name__)


class NotificationDispatcher:
    """
    Facade + Composite: sends one message through multiple channel strategies.
    Kafka consumers call event handlers → dispatcher → email / sms / push.
    """

    def __init__(self, channels: Iterable[NotificationChannel] | None = None):
        self._channels = list(channels) if channels is not None else list(get_default_channels())

    async def dispatch(
        self,
        message: NotificationMessage,
        *,
        channels: Iterable[ChannelType] | None = None,
    ) -> list[ChannelResult]:
        targets = self._resolve_channels(channels)
        if not targets:
            logger.warning("no_enabled_channels event=%s", message.subject)
            return []

        results: list[ChannelResult] = []
        for channel in targets:
            result = await channel.send(message)
            results.append(result)
            if not result.success:
                logger.warning(
                    "channel_failed type=%s detail=%s",
                    result.channel.value,
                    result.detail,
                )
        return results

    def _resolve_channels(
        self, channel_types: Iterable[ChannelType] | None
    ) -> list[NotificationChannel]:
        if channel_types is None:
            return [c for c in self._channels if c.is_enabled()]

        resolved: list[NotificationChannel] = []
        for channel_type in channel_types:
            channel = ChannelFactory.create(channel_type)
            if channel.is_enabled():
                resolved.append(channel)
        return resolved


_default_dispatcher: NotificationDispatcher | None = None


def get_dispatcher() -> NotificationDispatcher:
    global _default_dispatcher
    if _default_dispatcher is None:
        _default_dispatcher = NotificationDispatcher()
    return _default_dispatcher
