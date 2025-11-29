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
    
    # Redis Settings
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_DB: int = int(os.getenv("REDIS_DB", "0"))
    REDIS_PASSWORD: str | None = os.getenv("REDIS_PASSWORD")



settings = Settings()

__all__ = ("Settings", "settings")
