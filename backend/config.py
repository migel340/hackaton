import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env file if present (from backend/.env)
load_dotenv(Path(__file__).parent / ".env")


class Settings:
    """Simple settings holder that reads values from environment variables."""

    APP_NAME: str = os.getenv("APP_NAME", "hackaton")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("1", "true", "yes")
    DATABASE_URL: str | None = os.getenv("DATABASE_URL")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production-use-strong-key")
    OPENAI_KEY: str = os.getenv("OPENAI_KEY", "")
    
    # JWT Settings
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24h default
    
    # CORS Settings (comma-separated list of origins)
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://frontend:5173"
        ).split(",")
        if origin.strip()
    ]


settings = Settings()

__all__ = ("Settings", "settings")
