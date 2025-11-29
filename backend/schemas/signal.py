from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from models.signal import SignalType


# Schema do tworzenia sygnału
class UserSignalCreate(BaseModel):
    signal_type: SignalType
    category_id: Optional[int] = None


# Schema do aktualizacji sygnału
class UserSignalUpdate(BaseModel):
    is_active: Optional[bool] = None
    category_id: Optional[int] = None


# Schema odpowiedzi - pojedynczy sygnał
class UserSignalResponse(BaseModel):
    id: int
    user_id: int
    signal_type: SignalType
    category_id: Optional[int] = None
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True


# Schema odpowiedzi - lista sygnałów użytkownika
class UserSignalsResponse(BaseModel):
    user_id: int
    username: str
    signals: list[UserSignalResponse]


__all__ = [
    "UserSignalCreate",
    "UserSignalUpdate", 
    "UserSignalResponse",
    "UserSignalsResponse"
]
