from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from models.activity import ActivityType, UserActivity
from models.user import User
from schemas.activity import (
    UserActivitiesResponse,
    UserActivityCreate,
    UserActivityResponse,
)
from services.db import get_session
from services.dependencies import get_current_user

router = APIRouter(prefix="/activities", tags=["Activities"])


@router.post("/", response_model=UserActivityResponse, status_code=status.HTTP_201_CREATED)
def add_activity(
    activity_data: UserActivityCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Dodaj nową aktywność do profilu użytkownika.
    
    Użytkownik może mieć wiele aktywności jednocześnie:
    - FREELANCER
    - IDEA_CREATOR (Pomysłodawca)
    - FUNDATOR (Fundator projektu)
    """
    # Sprawdź czy użytkownik już ma tę aktywność
    existing = session.exec(
        select(UserActivity).where(
            UserActivity.user_id == current_user.id,
            UserActivity.activity_type == activity_data.activity_type,
            UserActivity.is_active == True
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User already has active activity: {activity_data.activity_type}"
        )
    
    # Utwórz nową aktywność
    if current_user.id is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User ID is missing"
        )
    
    new_activity = UserActivity(
        user_id=current_user.id,
        activity_type=activity_data.activity_type,
        is_active=True
    )
    
    session.add(new_activity)
    session.commit()
    session.refresh(new_activity)
    
    return new_activity


@router.get("/me", response_model=UserActivitiesResponse)
def get_my_activities(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Pobierz wszystkie aktywności aktualnie zalogowanego użytkownika.
    """
    activities = session.exec(
        select(UserActivity).where(
            UserActivity.user_id == current_user.id,
            UserActivity.is_active == True
        )
    ).all()
    
    return {
        "user_id": current_user.id,
        "username": current_user.username,
        "activities": activities
    }


@router.get("/user/{user_id}", response_model=UserActivitiesResponse)
def get_user_activities(
    user_id: int,
    session: Session = Depends(get_session),
):
    """
    Pobierz aktywności konkretnego użytkownika (publiczny endpoint).
    
    Nie wymaga autoryzacji - pozwala przeglądać aktywności innych użytkowników.
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    activities = session.exec(
        select(UserActivity).where(
            UserActivity.user_id == user_id,
            UserActivity.is_active == True
        )
    ).all()
    
    return {
        "user_id": user.id,
        "username": user.username,
        "activities": activities
    }


@router.delete("/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_activity(
    activity_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Usuń (dezaktywuj) aktywność.
    
    Użytkownik może usunąć tylko swoje własne aktywności.
    """
    activity = session.get(UserActivity, activity_id)
    
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found"
        )
    
    # Sprawdź czy aktywność należy do zalogowanego użytkownika
    if activity.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only remove your own activities"
        )
    
    # Dezaktywuj zamiast usuwać (soft delete)
    activity.is_active = False
    session.add(activity)
    session.commit()
    
    return None


@router.get("/types", response_model=list[str])
def get_activity_types():
    """
    Pobierz listę dostępnych typów aktywności.
    """
    return [activity_type.value for activity_type in ActivityType]
