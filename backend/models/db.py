from typing import Generator

from sqlmodel import Session, create_engine, SQLModel

from backend.config import settings


# Database URL from env via config, fallback to sqlite
DATABASE_URL = settings.DATABASE_URL or "sqlite:///./test.db"

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


__all__ = ["engine", "DATABASE_URL", "create_db_and_tables", "get_engine", "get_session"]
