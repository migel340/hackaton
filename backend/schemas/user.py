from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, EmailStr, Field, HttpUrl


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


# Schema do aktualizacji profilu użytkownika
class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    first_name: Optional[str] = Field(None, max_length=50)
    last_name: Optional[str] = Field(None, max_length=50)
    bio: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = None
    location: Optional[str] = Field(None, max_length=100)
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    website: Optional[str] = None
    skills: Optional[list[str]] = None
    experience_years: Optional[int] = Field(None, ge=0, le=50)


# Schema odpowiedzi - zwracany do frontu (bez hasła)
class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: Optional[datetime] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    website: Optional[str] = None
    skills: Optional[Any] = None
    experience_years: Optional[int] = None
    
    class Config:
        from_attributes = True  # Dla kompatybilności z SQLModel


# Schema do listy użytkowników (uproszczony)
class UserListItem(BaseModel):
    id: int
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    
    class Config:
        from_attributes = True


class UserList(BaseModel):
    users: list[UserListItem]
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
    "UserListItem",
    "Token",
    "TokenData",
]
