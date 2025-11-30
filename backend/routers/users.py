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


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    """
    Pobierz profil aktualnie zalogowanego użytkownika.
    """
    return current_user


@router.put("/me", response_model=UserResponse)
def update_current_user_profile(
    user_update: UserUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Aktualizuj profil aktualnie zalogowanego użytkownika.
    """
    # Aktualizuj tylko podane pola
    if user_update.username is not None:
        existing = session.exec(
            select(User).where(User.username == user_update.username, User.id != current_user.id)
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        current_user.username = user_update.username
    
    if user_update.email is not None:
        existing = session.exec(
            select(User).where(User.email == user_update.email, User.id != current_user.id)
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already taken"
            )
        current_user.email = user_update.email
    
    # Aktualizuj pola profilu
    if user_update.first_name is not None:
        current_user.first_name = user_update.first_name
    if user_update.last_name is not None:
        current_user.last_name = user_update.last_name
    if user_update.bio is not None:
        current_user.bio = user_update.bio
    if user_update.avatar_url is not None:
        current_user.avatar_url = user_update.avatar_url
    if user_update.location is not None:
        current_user.location = user_update.location
    if user_update.linkedin_url is not None:
        current_user.linkedin_url = user_update.linkedin_url
    if user_update.github_url is not None:
        current_user.github_url = user_update.github_url
    if user_update.website is not None:
        current_user.website = user_update.website
    if user_update.skills is not None:
        current_user.skills = user_update.skills
    if user_update.experience_years is not None:
        current_user.experience_years = user_update.experience_years
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return current_user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_user(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Usuń konto aktualnie zalogowanego użytkownika.
    """
    session.delete(current_user)
    session.commit()
    
    return None


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

<<<<<<< Updated upstream

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_user(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Usuń konto aktualnie zalogowanego użytkownika.
    """
    session.delete(current_user)
    session.commit()
    
    return None

=======
>>>>>>> Stashed changes
