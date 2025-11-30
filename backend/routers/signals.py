# routers/signals.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, col, select

from models.signal import UserSignal
from models.user import User
from schemas.signal import (
    SignalMatchAllResponse,
    SignalMatchResponse,
    UserSignalCreate,
    UserSignalResponse,
    UserSignalsResponse,
)
from services.db import get_session
from services.dependencies import get_current_user
from services.openai import (
    calculate_bulk_signal_matches,
    get_matching_category_ids,
)

router = APIRouter(prefix="/signals", tags=["Signals"])


@router.post("/", response_model=UserSignalResponse, status_code=status.HTTP_201_CREATED)
def add_signal(
    signal_data: UserSignalCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Dodaj nowy sygnał do profilu użytkownika.
    
    Użytkownik może mieć wiele sygnałów tej samej kategorii (np. kilka pomysłów na startup).
    
    signal_category_id:
    - 1 = Freelancer
    - 2 = Startup Idea
    - 3 = Investor
    
    details: dowolny JSON (string, lista, obiekt - cokolwiek z frontu)
    """
    # Sprawdź czy signal_category_id jest poprawny (1-3)
    if signal_data.signal_category_id not in [1, 2, 3]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="signal_category_id must be 1, 2, or 3"
        )
    
    if current_user.id is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User ID is missing"
        )
    
    new_signal = UserSignal(
        user_id=current_user.id,
        signal_category_id=signal_data.signal_category_id,
        details=signal_data.details,
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
    """
    signal = session.get(UserSignal, signal_id)
    
    if not signal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signal not found"
        )
    
    if signal.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only remove your own signals"
        )
    
    signal.is_active = False
    session.add(signal)
    session.commit()
    
    return None


@router.get("/match-all", response_model=SignalMatchAllResponse)
def match_all_signals(
    min_accurate: float = 0,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Znajdź dopasowania dla WSZYSTKICH sygnałów użytkownika naraz.
    
    - **min_accurate**: Minimalny próg dopasowania (0-100), domyślnie 0
    
    Zwraca wszystkie dopasowania pogrupowane po sygnałach źródłowych.
    """
    # Pobierz wszystkie aktywne sygnały użytkownika
    user_signals = session.exec(
        select(UserSignal).where(
            UserSignal.user_id == current_user.id,
            UserSignal.is_active == True  # noqa: E712
        )
    ).all()
    
    if not user_signals:
        return {
            "user_id": current_user.id,
            "total_signals": 0,
            "total_matches": 0,
            "results": []
        }
    
    results = []
    total_matches = 0
    
    for source_signal in user_signals:
        # Pomiń sygnały bez ID (nie powinno się zdarzyć)
        if source_signal.id is None:
            continue
            
        # Pobierz kategorie które pasują do tego sygnału
        matching_category_ids = get_matching_category_ids(source_signal.signal_category_id)
        
        if not matching_category_ids:
            results.append({
                "source_signal_id": source_signal.id,
                "matches": []
            })
            continue
        
        # Pobierz sygnały z pasujących kategorii (nie własne)
        target_signals = session.exec(
            select(UserSignal).where(
                col(UserSignal.signal_category_id).in_(matching_category_ids),
                UserSignal.user_id != current_user.id,
                UserSignal.is_active == True  # noqa: E712
            )
        ).all()
        
        if not target_signals:
            results.append({
                "source_signal_id": source_signal.id,
                "matches": []
            })
            continue
        
        # Przygotuj dane do matchowania
        target_data = [
            {"id": sig.id, "details": sig.details}
            for sig in target_signals
        ]
        
        # Słownik do szybkiego dostępu do details
        target_details_map = {sig.id: sig.details for sig in target_signals}
        
        # Oblicz dopasowanie przez OpenAI
        matches = calculate_bulk_signal_matches(
            source_signal_id=source_signal.id,
            source_details=source_signal.details,
            target_signals=target_data
        )
        
        # Dodaj details do wyników i filtruj po min_accurate
        filtered_matches = [
            {**m, "details": target_details_map.get(m["signal_id"])}
            for m in matches if m["accurate"] >= min_accurate
        ]
        
        # Sortuj po accurate malejąco
        filtered_matches.sort(key=lambda x: x["accurate"], reverse=True)
        
        total_matches += len(filtered_matches)
        
        results.append({
            "source_signal_id": source_signal.id,
            "matches": filtered_matches
        })
    
    return {
        "user_id": current_user.id,
        "total_signals": len(user_signals),
        "total_matches": total_matches,
        "results": results
    }


@router.get("/match/{signal_id}", response_model=SignalMatchResponse)
def match_signals(
    signal_id: int,
    min_accurate: float = 0,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Znajdź pasujące sygnały dla danego sygnału użytkownika.
    
    - **min_accurate**: Minimalny próg dopasowania (0-100), domyślnie 0
    
    Logika matchowania:
    - FREELANCER (1) szuka STARTUP_IDEA (2)
    - STARTUP_IDEA (2) szuka FREELANCER (1) i INVESTOR (3)
    - INVESTOR (3) szuka STARTUP_IDEA (2)
    
    Zwraca listę pasujących sygnałów z współczynnikiem dopasowania (0-100).
    """
    # Pobierz sygnał źródłowy
    source_signal = session.get(UserSignal, signal_id)
    
    if not source_signal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signal not found"
        )
    
    # Sprawdź czy sygnał należy do użytkownika
    if source_signal.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only match your own signals"
        )
    
    # Pobierz kategorie które pasują
    matching_category_ids = get_matching_category_ids(source_signal.signal_category_id)
    
    if not matching_category_ids:
        return {
            "source_signal_id": signal_id,
            "matches": []
        }
    
    # Pobierz sygnały z pasujących kategorii (nie własne)
    target_signals = session.exec(
        select(UserSignal).where(
            col(UserSignal.signal_category_id).in_(matching_category_ids),
            UserSignal.user_id != current_user.id,
            UserSignal.is_active == True  # noqa: E712
        )
    ).all()
    
    if not target_signals:
        return {
            "source_signal_id": signal_id,
            "matches": []
        }
    
    # Przygotuj dane do matchowania
    target_data = [
        {"id": sig.id, "details": sig.details}
        for sig in target_signals
    ]
    
    # Słownik do szybkiego dostępu do details
    target_details_map = {sig.id: sig.details for sig in target_signals}
    
    # Oblicz dopasowanie przez OpenAI
    matches = calculate_bulk_signal_matches(
        source_signal_id=signal_id,
        source_details=source_signal.details,
        target_signals=target_data
    )
    
    # Dodaj details do wyników i filtruj po min_accurate
    filtered_matches = [
        {**m, "details": target_details_map.get(m["signal_id"])}
        for m in matches if m["accurate"] >= min_accurate
    ]
    
    # Sortuj po accurate malejąco
    filtered_matches.sort(key=lambda x: x["accurate"], reverse=True)
    
    return {
        "source_signal_id": signal_id,
        "matches": filtered_matches
    }
