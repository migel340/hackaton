from typing import Optional, List
from pydantic import BaseModel

from models.category import CategoryType


# --- Wejście (create) ---
class CategoryCreate(BaseModel):
    name: str


# --- Wejście (partial update) ---
class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    # jeśli dodasz soft-delete w modelu:
    # is_active: Optional[bool] = None


# --- Wyjście (pojedyncza kategoria) ---
class CategoryResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


# --- Wyjście (lista kategorii) ---
class CategoriesResponse(BaseModel):
    items: List[CategoryResponse]


# --- (opcjonalnie) Wyjście dla endpointu /categories/types ---
class CategoryTypesResponse(BaseModel):
    types: List[str]  # np. ["Sport", "IT", ...]
    # Alternatywnie, gdy chcesz zwracać Enum-y:
    # types: List[CategoryType]


__all__ = [
    "CategoryCreate",
    "CategoryUpdate",
    "CategoryResponse",
    "CategoriesResponse",
    "CategoryTypesResponse",
]