from __future__ import annotations

from datetime import datetime
from typing import Optional
from enum import Enum

from sqlmodel import Field, SQLModel


class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)


class CategoryType(str, Enum):
    Sport = "Sport"
    IT = "IT"
    construction = "Budownictow"
    electrics = "Elektryka"
    entertainment = "Rozrywka"
    other = "Inne"

__all__ = ["Category", "CategoryType"]