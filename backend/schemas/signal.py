from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field, field_validator


# Schema do tworzenia sygnału
class UserSignalCreate(BaseModel):
    signal_category_id: int = Field(..., ge=1, le=3, examples=[1])  # 1=Freelancer, 2=Startup Idea, 3=Investor
    details: Optional[Any] = Field(default=None, examples=[[1, "JS", "dasad4", "dsalkj"]])

    @field_validator('signal_category_id')
    @classmethod
    def validate_signal_category_id(cls, v: int) -> int:
        if v not in [1, 2, 3]:
            raise ValueError('signal_category_id must be 1, 2, or 3')
        return v

    model_config = {
        "json_schema_extra": {
            "examples": [
                {"signal_category_id": 1, "details": "single_value"},
                {"signal_category_id": 2, "details": [1, "JS", "Python", "React"]},
                {"signal_category_id": 3, "details": {"skills": ["AI", "ML"], "budget": 10000}},
            ]
        }
    }


# Schema do aktualizacji sygnału
class UserSignalUpdate(BaseModel):
    is_active: Optional[bool] = None
    details: Optional[Any] = None


# Schema odpowiedzi - pojedynczy sygnał
class UserSignalResponse(BaseModel):
    id: int
    user_id: int
    signal_category_id: int
    details: Optional[Any] = None
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True


# Schema odpowiedzi - lista sygnałów użytkownika
class UserSignalsResponse(BaseModel):
    user_id: int
    username: str
    signals: list[UserSignalResponse]


# Schema dla SignalCategory
class SignalCategoryResponse(BaseModel):
    id: int
    name: str
    label: str
    
    class Config:
        from_attributes = True


# Schema dla matchowania sygnałów
class SignalMatchResult(BaseModel):
    signal_id: int
    accurate: float = Field(..., ge=0, le=100)


class SignalMatchResponse(BaseModel):
    source_signal_id: int
    matches: list[SignalMatchResult]


class SignalMatchAllResponse(BaseModel):
    """Odpowiedź dla match-all - wszystkie sygnały użytkownika z dopasowaniami"""
    user_id: int
    total_signals: int
    total_matches: int
    results: list[SignalMatchResponse]


__all__ = [
    "UserSignalCreate",
    "UserSignalUpdate", 
    "UserSignalResponse",
    "UserSignalsResponse",
    "SignalCategoryResponse",
    "SignalMatchResult",
    "SignalMatchResponse",
    "SignalMatchAllResponse",
]
