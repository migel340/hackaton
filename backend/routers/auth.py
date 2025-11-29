from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from models.user import User
from schemas.user import Token, UserCreate, UserLogin, UserResponse
from services.auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_password_hash,
    verify_password,
)
from services.db import get_session
from services.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, session: Session = Depends(get_session)):
    """
    Rejestracja nowego użytkownika.
    
    - **username**: Unikalna nazwa użytkownika (3-50 znaków)
    - **email**: Adres email (opcjonalny)
    - **password**: Hasło (minimum 8 znaków)
    """
    # Sprawdź czy username już istnieje
    existing_user = session.exec(
        select(User).where(User.username == user_data.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Sprawdź czy email już istnieje (jeśli podany)
    if user_data.email:
        existing_email = session.exec(
            select(User).where(User.email == user_data.email)
        ).first()
        
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Utwórz nowego użytkownika
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        is_active=True  # Automatycznie aktywny, możesz zmienić na False i wymagać weryfikacji
    )
    
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, session: Session = Depends(get_session)):
    """
    Logowanie użytkownika - zwraca JWT token.
    
    - **email**: Adres email użytkownika
    - **password**: Hasło
    """
    # Znajdź użytkownika po emailu
    user = session.exec(
        select(User).where(User.email == credentials.email)
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Sprawdź hasło
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Sprawdź czy użytkownik jest aktywny
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    # Utwórz JWT token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "username": user.username},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Pobierz informacje o aktualnie zalogowanym użytkowniku.
    
    Wymaga tokenu JWT w nagłówku Authorization: Bearer <token>
    """
    return current_user


@router.post("/logout")
def logout():
    """
    Wylogowanie użytkownika.
    
    W przypadku JWT, wylogowanie odbywa się po stronie klienta
    poprzez usunięcie tokenu. Ten endpoint jest opcjonalny.
    """
    return {"message": "Successfully logged out"}

