from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class ActivityType(str, Enum):
    """Typy aktywności użytkownika"""
    FREELANCER = "FREELANCER"
    IDEA_CREATOR = "IDEA_CREATOR"  # Pomysłodawca / Idea Creator
    FUNDATOR = "FUNDATOR"  # Fundator projektu


class UserActivity(SQLModel, table=True):
    """
    Tabela aktywności użytkowników.
    Jeden użytkownik może mieć wiele aktywności jednocześnie.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    activity_type: ActivityType = Field(index=True)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)  # Czy aktywność jest nadal aktywna
    
    class Config:
        use_enum_values = True


__all__ = ["UserActivity", "ActivityType"]
