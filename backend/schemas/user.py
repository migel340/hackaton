from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# Base schema - wspólne pola
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: Optional[EmailStr] = None


# Schema do rejestracji - wymaga hasła
class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)


# Schema do logowania
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Schema do aktualizacji użytkownika
class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None


# Schema odpowiedzi - zwracany do frontu (bez hasła)
class UserResponse(UserBase):
    id: int
    is_active: bool
    
    class Config:
        from_attributes = True  # Dla kompatybilności z SQLModel


# Schema do listy użytkowników
class UserList(BaseModel):
    users: list[UserResponse]
    total: int


# JWT Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None
    username: Optional[str] = None


__all__ = [
    "UserBase",
    "UserCreate",
    "UserLogin",
    "UserUpdate",
    "UserResponse",
    "UserList",
    "Token",
    "TokenData",
]
