from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from models.category import Category
    from models.user import User


class SignalType(str, Enum):
    """Typy sygnałów użytkownika"""
    FREELANCER = "FREELANCER"
    IDEA_CREATOR = "IDEA_CREATOR"  # Pomysłodawca / Idea Creator
    FUNDATOR = "FUNDATOR"  # Fundator projektu


class UserSignal(SQLModel, table=True):
    """
    Tabela sygnałów użytkowników.
    Jeden użytkownik może mieć wiele sygnałów jednocześnie.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    signal_type: SignalType = Field(index=True)
    category_id: Optional[int] = Field(default=None, foreign_key="category.id", index=True)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)  # Czy sygnał jest nadal aktywny
    
    # Relationships
    user: Optional["User"] = Relationship(back_populates="signals")
    category: Optional["Category"] = Relationship(back_populates="signals")
    
    class Config:
        use_enum_values = True


__all__ = ["UserSignal", "SignalType"]
