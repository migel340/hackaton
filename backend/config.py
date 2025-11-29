from pathlib import Path
from dotenv import load_dotenv
import os


# Load .env file if present
load_dotenv(Path(".env"))


class Settings:
    """Simple settings holder that reads values from environment variables."""

    APP_NAME: str = os.getenv("APP_NAME", "hackaton")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("1", "true", "yes")
    DATABASE_URL: str | None = os.getenv("DATABASE_URL")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me")


settings = Settings()

__all__ = ("Settings", "settings")
