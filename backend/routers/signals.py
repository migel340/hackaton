# routers/signals.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from models.signal import SignalType, UserSignal
from models.user import User
from schemas.signal import (
    UserSignalCreate,
    UserSignalResponse,
    UserSignalsResponse,
)
from services.db import get_session
from services.dependencies import get_current_user

router = APIRouter(prefix="/signals", tags=["Signals"])


@router.post("/", response_model=UserSignalResponse, status_code=status.HTTP_201_CREATED)
def add_signal(
    signal_data: UserSignalCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Dodaj nowy sygnał do profilu użytkownika.
    
    Użytkownik może mieć wiele sygnałów jednocześnie:
    - FREELANCER
    - IDEA_CREATOR (Pomysłodawca)
    - FUNDATOR (Fundator projektu)
    """
    # Sprawdź czy użytkownik już ma ten sygnał
    existing = session.exec(
        select(UserSignal).where(
            UserSignal.user_id == current_user.id,
            UserSignal.signal_type == signal_data.signal_type,
            UserSignal.is_active == True  # noqa: E712
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User already has active signal: {signal_data.signal_type}"
        )
    
    # Utwórz nowy sygnał
    if current_user.id is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User ID is missing"
        )
    
    new_signal = UserSignal(
        user_id=current_user.id,
        signal_type=signal_data.signal_type,
        category_id=signal_data.category_id,
        is_active=True
    )
    
    session.add(new_signal)
    session.commit()
    session.refresh(new_signal)
    
    return new_signal


@router.get("/me", response_model=UserSignalsResponse)
def get_my_signals(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Pobierz wszystkie sygnały aktualnie zalogowanego użytkownika.
    """
    signals = session.exec(
        select(UserSignal).where(
            UserSignal.user_id == current_user.id,
            UserSignal.is_active == True  # noqa: E712
        )
    ).all()
    
    return {
        "user_id": current_user.id,
        "username": current_user.username,
        "signals": signals
    }


@router.get("/user/{user_id}", response_model=UserSignalsResponse)
def get_user_signals(
    user_id: int,
    session: Session = Depends(get_session),
):
    """
    Pobierz sygnały konkretnego użytkownika (publiczny endpoint).
    
    Nie wymaga autoryzacji - pozwala przeglądać sygnały innych użytkowników.
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    signals = session.exec(
        select(UserSignal).where(
            UserSignal.user_id == user_id,
            UserSignal.is_active == True  # noqa: E712
        )
    ).all()
    
    return {
        "user_id": user.id,
        "username": user.username,
        "signals": signals
    }


@router.delete("/{signal_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_signal(
    signal_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Usuń (dezaktywuj) sygnał.
    
    Użytkownik może usunąć tylko swoje własne sygnały.
    """
    signal = session.get(UserSignal, signal_id)
    
    if not signal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signal not found"
        )
    
    # Sprawdź czy sygnał należy do zalogowanego użytkownika
    if signal.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only remove your own signals"
        )
    
    # Dezaktywuj zamiast usuwać (soft delete)
    signal.is_active = False
    session.add(signal)
    session.commit()
    
    return None


@router.get("/types", response_model=list[str])
def get_signal_types():
    """
    Pobierz listę dostępnych typów sygnałów.
    """
    return [signal_type.value for signal_type in SignalType]
