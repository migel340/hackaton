from __future__ import annotations

from datetime import datetime
from typing import Any, ClassVar, Optional

from sqlalchemy.dialects.postgresql import JSON
from sqlmodel import Column, Field, SQLModel


class User(SQLModel, table=True):
    __tablename__: ClassVar[str] = "user"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: Optional[str] = Field(default=None, index=True)
    hashed_password: str  # Hasło w formie zahashowanej
    is_active: bool = Field(default=False)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Rozszerzony profil
    first_name: Optional[str] = Field(default=None, max_length=50)
    last_name: Optional[str] = Field(default=None, max_length=50)
    bio: Optional[str] = Field(default=None, max_length=500)  # Krótki opis
    avatar_url: Optional[str] = Field(default=None)  # URL do awatara
    location: Optional[str] = Field(default=None, max_length=100)  # Miasto/kraj
    linkedin_url: Optional[str] = Field(default=None)  # Profil LinkedIn
    github_url: Optional[str] = Field(default=None)  # Profil GitHub
    website: Optional[str] = Field(default=None)  # Strona www
    skills: Optional[Any] = Field(default=None, sa_column=Column(JSON))  # Lista umiejętności jako JSON
    experience_years: Optional[int] = Field(default=None)  # Lata doświadczenia


__all__ = ["User"]