from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from models.signal import UserSignal


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: Optional[str] = Field(default=None, index=True)
    hashed_password: str  # Hasło w formie zahashowanej
    is_active: bool = Field(default=False)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    signals: List["UserSignal"] = Relationship(back_populates="user")

__all__ = ["User"]