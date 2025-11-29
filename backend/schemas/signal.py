from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from models.signal import SignalType


# Schema do tworzenia sygnału
class UserSignalCreate(BaseModel):
    signal_type: SignalType = Field(..., examples=["FREELANCER"])
    category_id: Optional[int] = Field(default=None, examples=[None])

    model_config = {
        "json_schema_extra": {
            "examples": [
                {"signal_type": "FREELANCER"},
                {"signal_type": "IDEA_CREATOR", "category_id": 1},
            ]
        }
    }


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
