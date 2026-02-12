import logging
import secrets

from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)

_DEFAULT_JWT_SECRET = "CHANGE-ME-" + secrets.token_urlsafe(16)


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./data/ea-dashboard.db"
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:8080"]

    # JWT — set JWT_SECRET_KEY in .env for production (tokens survive restarts)
    JWT_SECRET_KEY: str = _DEFAULT_JWT_SECRET
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Initial admin (created on first startup if no users exist)
    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "admin123"
    ADMIN_NAME: str = "Administrator"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()

if settings.JWT_SECRET_KEY == _DEFAULT_JWT_SECRET:
    logger.warning(
        "JWT_SECRET_KEY not set — using auto-generated key. "
        "Tokens will not survive restarts. Set JWT_SECRET_KEY in .env for production."
    )
