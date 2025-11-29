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
    
    # JWT Settings
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24h default



settings = Settings()

__all__ = ("Settings", "settings")
