from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    PROJECT_NAME: str = "Notification Service"

    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"

    # Email — SMTP (Mailtrap)
    EMAIL_ENABLED: bool = True
    SMTP_HOST: str = "sandbox.smtp.mailtrap.io"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "Foody <mail@foody.local>"
    SMTP_STARTTLS: bool = True
    SMTP_USE_SSL: bool = False

    # SMS — Twilio
    SMS_ENABLED: bool = False
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""

    # Push — Firebase Cloud Messaging
    PUSH_ENABLED: bool = False
    FCM_SERVER_KEY: str = ""

    AUTH_SERVICE_URL: str = "http://auth-service:5000"
    ORDER_SERVICE_URL: str = "http://order-service:5002"

    KAFKA_BOOTSTRAP_SERVERS: str = "kafka:9092"
    KAFKA_GROUP_ID: str = "notification-service"


@lru_cache
def get_settings() -> Settings:
    return Settings()
