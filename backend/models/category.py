from __future__ import annotations

from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from models.signal import UserSignal


class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    description: Optional[str] = Field(default=None)  # Tekst do embeddingu
    
    # Relationship
    signals: list["UserSignal"] = Relationship(back_populates="category")


__all__ = ["Category"]