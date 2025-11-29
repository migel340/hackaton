from typing import Generator

from sqlmodel import Session, SQLModel, create_engine

from config import settings
from models.user import User  # noqa: F401 - needed for SQLModel.metadata

# Database URL from env via config
DATABASE_URL = settings.DATABASE_URL

if DATABASE_URL is None:
    raise ValueError("DATABASE_URL is not set in environment variables")

# Engine (shared)
engine = create_engine(DATABASE_URL, echo=bool(settings.DEBUG))


def create_db_and_tables() -> None:
    """Create tables for all SQLModel models."""
    SQLModel.metadata.create_all(engine)


def get_engine():
    return engine


def get_session() -> Generator[Session, None, None]:
    """Yield a DB session. Use as FastAPI dependency: Depends(get_session)."""
    with Session(engine) as session:
        yield session


__all__ = [
    "engine",
    "DATABASE_URL",
    "create_db_and_tables",
    "get_engine",
    "get_session",
]
