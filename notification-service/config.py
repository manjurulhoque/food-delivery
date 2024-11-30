from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # API Settings
    PROJECT_NAME: str = "Notification Service"
    
    # JWT Settings
    JWT_SECRET_KEY: str = "z8B82VSkyLR7IUhDfe4ekI5aaU2DD5gWl08cP0P-pnpZHppnme6L54-ZpgXxnaIHdcMjWlJtPJRyMZzQruUmcA"
    JWT_ALGORITHM: str = "HS256"
    
    # Email Settings
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    
    # Service URLs
    AUTH_SERVICE_URL: str = "http://auth-service:5000"
    ORDER_SERVICE_URL: str = "http://order-service:5002"
    
    # Kafka Settings
    KAFKA_BOOTSTRAP_SERVERS: str = "kafka:9092"
    KAFKA_GROUP_ID: str = "notification-service"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache
def get_settings():
    return Settings() 