from abc import ABC, abstractmethod

from notifications.models import ChannelResult, ChannelType, NotificationMessage


class NotificationChannel(ABC):
    """Strategy interface — one implementation per delivery channel (email, sms, push)."""

    @property
    @abstractmethod
    def channel_type(self) -> ChannelType:
        pass

    @abstractmethod
    def is_enabled(self) -> bool:
        pass

    @abstractmethod
    async def send(self, message: NotificationMessage) -> ChannelResult:
        pass
