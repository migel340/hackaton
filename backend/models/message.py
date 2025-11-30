from __future__ import annotations

from datetime import datetime
from typing import ClassVar, Optional

from sqlmodel import Field, SQLModel


class Message(SQLModel, table=True):
    """
    Tabela wiadomości między użytkownikami.
    """
    __tablename__: ClassVar[str] = "message"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    sender_id: int = Field(foreign_key="user.id", index=True)
    receiver_id: int = Field(foreign_key="user.id", index=True)
    content: str = Field(max_length=2000)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    is_read: bool = Field(default=False)


__all__ = ["Message"]
