from __future__ import annotations

from datetime import datetime
from typing import Any, ClassVar, Optional

from sqlalchemy.dialects.postgresql import JSON
from sqlmodel import Column, Field, SQLModel


class SignalCategory(SQLModel, table=True):
    """
    Tabela kategorii sygnałów.
    Predefiniowane kategorie: FREELANCER, STARTUP_IDEA, INVESTOR
    """
    __tablename__: ClassVar[str] = "signal_category"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)  # FREELANCER, STARTUP_IDEA, INVESTOR
    label: str = Field(index=True)  # Freelancer, Pomysł na startup, Inwestor


class UserSignal(SQLModel, table=True):
    """
    Tabela sygnałów użytkowników.
    Jeden użytkownik może mieć wiele sygnałów jednocześnie.
    """
    __tablename__: ClassVar[str] = "user_signal"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    signal_category_id: int = Field(foreign_key="signal_category.id", index=True)
    details: Optional[Any] = Field(default=None, sa_column=Column(JSON))  # Dowolny JSON z frontu
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)


__all__ = ["UserSignal", "SignalCategory"]
