from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from models.activity import ActivityType


# Schema do tworzenia aktywności
class UserActivityCreate(BaseModel):
    activity_type: ActivityType


# Schema do aktualizacji aktywności
class UserActivityUpdate(BaseModel):
    is_active: Optional[bool] = None


# Schema odpowiedzi - pojedyncza aktywność
class UserActivityResponse(BaseModel):
    id: int
    user_id: int
    activity_type: ActivityType
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True


# Schema odpowiedzi - lista aktywności użytkownika
class UserActivitiesResponse(BaseModel):
    user_id: int
    username: str
    activities: list[UserActivityResponse]


__all__ = [
    "UserActivityCreate",
    "UserActivityUpdate", 
    "UserActivityResponse",
    "UserActivitiesResponse"
]
