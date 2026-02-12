import secrets

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./data/ea-dashboard.db"
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:8080"]

    # JWT
    JWT_SECRET_KEY: str = secrets.token_urlsafe(32)
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Initial admin (created on first startup if no users exist)
    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "admin123"
    ADMIN_NAME: str = "Administrator"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
