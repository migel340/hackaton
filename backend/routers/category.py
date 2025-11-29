# routers/categories.py
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from models.category import Category
from schemas.category import (
    CategoriesResponse,
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
)
from services.db import get_session
from services.dependencies import get_current_user

router = APIRouter(prefix="/categories", tags=["Categories"])

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUserDep = Annotated[object, Depends(get_current_user)]


# --- CREATE ---
@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate,
    session: SessionDep,
):
    # pre-check unikalności (case-insensitive), zanim wjedzie UNIQUE(name)
    exists = session.exec(
        select(Category).where(func.lower(Category.name) == func.lower(category_in.name))
    ).first()
    if exists:
        raise HTTPException(status_code=400, detail="Category with this name already exists")

    category = Category(name=category_in.name, description=category_in.description)
    session.add(category)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    session.refresh(category)
    return category


# --- LIST ---
@router.get("/", response_model=CategoriesResponse)
def list_categories(
    session: SessionDep,
    q: Optional[str] = Query(None, description="Filtr po fragmencie nazwy (case-insensitive)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
):
    stmt = select(Category)
    if q:
        stmt = stmt.where(func.lower(Category.name).like(f"%{q.lower()}%"))
    stmt = stmt.order_by(Category.name).offset(skip).limit(limit)

    categories = session.exec(stmt).all()
    items = [CategoryResponse.model_validate(c) for c in categories]
    return CategoriesResponse(items=items)


# --- READ ONE ---
@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, session: SessionDep):
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


# --- UPDATE (PATCH) ---
@router.patch("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    session: SessionDep,
):
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    update_data = category_in.model_dump(exclude_unset=True)

    if "name" in update_data and update_data["name"] and update_data["name"] != category.name:
        # unikalność nazwy (case-insensitive) z wykluczeniem aktualnego rekordu
        exists = session.exec(
            select(Category).where(
                func.lower(Category.name) == func.lower(update_data["name"]),
                Category.id != category_id,
            )
        ).first()
        if exists:
            raise HTTPException(status_code=400, detail="Category with this name already exists")
        category.name = update_data["name"]
    
    if "description" in update_data:
        category.description = update_data["description"]

    session.add(category)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    session.refresh(category)
    return category


# --- DELETE (hard delete; model nie ma is_active) ---
@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    session: SessionDep,
):
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    session.delete(category)
    session.commit()
    return None
