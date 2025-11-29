from typing import List, Optional

from pydantic import BaseModel


# --- Wejście (create) ---
class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None


# --- Wejście (partial update) ---
class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


# --- Wyjście (pojedyncza kategoria) ---
class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


# --- Wyjście (lista kategorii) ---
class CategoriesResponse(BaseModel):
    items: List[CategoryResponse]


__all__ = [
    "CategoryCreate",
    "CategoryUpdate",
    "CategoryResponse",
    "CategoriesResponse",
]