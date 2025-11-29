from typing import Generator

from sqlmodel import Session, SQLModel, create_engine, select

from config import settings
from models.signal import (  # noqa: F401 - needed for SQLModel.metadata
    SignalCategory,
    UserSignal,
)
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
    seed_signal_categories()


def seed_signal_categories() -> None:
    """Seed signal_category table with predefined categories."""
    categories = [
        {"id": 1, "name": "FREELANCER", "label": "Freelancer"},
        {"id": 2, "name": "STARTUP_IDEA", "label": "Pomysł na startup"},
        {"id": 3, "name": "INVESTOR", "label": "Inwestor"},
    ]
    
    with Session(engine) as session:
        for cat_data in categories:
            existing = session.exec(
                select(SignalCategory).where(SignalCategory.id == cat_data["id"])
            ).first()
            
            if not existing:
                category = SignalCategory(**cat_data)
                session.add(category)
        
        session.commit()


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
    "seed_signal_categories",
]
