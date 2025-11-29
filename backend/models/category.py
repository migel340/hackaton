from __future__ import annotations

from typing import Optional

from sqlmodel import Field, SQLModel


class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    description: Optional[str] = Field(default=None)  # Tekst do embeddingu


__all__ = ["Category"]