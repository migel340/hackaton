from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from models.user import User
from schemas.user import UserList, UserResponse, UserUpdate
from services.db import get_session
from services.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=UserList)
def get_users(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),  # Wymaga autentykacji
):
    """
    Pobierz listę użytkowników (wymaga autentykacji).
    
    - **skip**: Liczba użytkowników do pominięcia (paginacja)
    - **limit**: Maksymalna liczba użytkowników do zwrócenia
    """
    users = session.exec(select(User).offset(skip).limit(limit)).all()
    total = len(session.exec(select(User)).all())
    
    return {"users": users, "total": total}


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    session: Session = Depends(get_session),
):
    """
    Pobierz użytkownika po ID (publiczny endpoint).
    
    Nie wymaga autoryzacji - pozwala przeglądać profile innych użytkowników.
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),  # Wymaga autentykacji
):
    """
    Aktualizuj użytkownika (wymaga autentykacji).
    
    Użytkownik może edytować tylko swój własny profil.
    """
    # Sprawdź czy użytkownik edytuje swój profil
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own profile"
        )
    
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Aktualizuj tylko podane pola
    if user_update.username is not None:
        # Sprawdź czy nowa nazwa użytkownika jest dostępna
        existing = session.exec(
            select(User).where(User.username == user_update.username, User.id != user_id)
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        user.username = user_update.username
    
    if user_update.email is not None:
        # Sprawdź czy nowy email jest dostępny
        existing = session.exec(
            select(User).where(User.email == user_update.email, User.id != user_id)
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already taken"
            )
        user.email = user_update.email
    
    if user_update.is_active is not None:
        user.is_active = user_update.is_active
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),  # Wymaga autentykacji
):
    """
    Usuń użytkownika (wymaga autentykacji).
    
    Użytkownik może usunąć tylko swój własny profil.
    """
    # Sprawdź czy użytkownik usuwa swój profil
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own profile"
        )
    
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    session.delete(user)
    session.commit()
    
    return None

