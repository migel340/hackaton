from pathlib import Path
from pydantic import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
		"""Application settings loaded from environment variables or a `.env` file.

		Usage:
			- Put variables in a `.env` file at the project root, or export them in the environment.
			- Access values via the `settings` instance below, e.g. `settings.DATABASE_URL`.
		"""

		APP_NAME: str = "hackaton"
		DEBUG: bool = False
		DATABASE_URL: str | None = None
		SECRET_KEY: str = "change-me"

		model_config = SettingsConfigDict(
				env_file=Path(".env"),
				env_file_encoding="utf-8",
		)


settings = Settings()

__all__ = ("Settings", "settings")
