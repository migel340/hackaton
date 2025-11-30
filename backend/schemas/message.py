from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class MessageCreate(BaseModel):
    receiver_id: int
    content: str = Field(..., min_length=1, max_length=2000)


class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    created_at: datetime
    is_read: bool
    
    class Config:
        from_attributes = True


class MessageWithUser(MessageResponse):
    """Wiadomość z danymi nadawcy"""
    sender_username: Optional[str] = None
    sender_avatar: Optional[str] = None


class ConversationPreview(BaseModel):
    """Podgląd konwersacji na liście"""
    user_id: int
    username: str
    avatar_url: Optional[str] = None
    last_message: str
    last_message_at: datetime
    unread_count: int


class ConversationsResponse(BaseModel):
    conversations: list[ConversationPreview]
    total_unread: int


class MessagesResponse(BaseModel):
    messages: list[MessageResponse]
    other_user_id: int
    other_username: str


class ChatWebSocketMessage(BaseModel):
    """Format wiadomości WebSocket"""
    type: str  # "new_message", "message_read", "typing"
    message: Optional[MessageResponse] = None
    sender_id: Optional[int] = None
    receiver_id: Optional[int] = None


__all__ = [
    "MessageCreate",
    "MessageResponse", 
    "MessageWithUser",
    "ConversationPreview",
    "ConversationsResponse",
    "MessagesResponse",
    "ChatWebSocketMessage",
]
