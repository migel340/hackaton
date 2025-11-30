"""
Router do obsługi chatu między użytkownikami.
"""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from sqlmodel import Session, select, or_, and_, func, desc

from services.db import get_session
from services.auth import decode_access_token
from services.dependencies import get_current_user
from services.chat_ws import chat_manager
from models.user import User
from models.message import Message
from schemas.message import (
    MessageCreate,
    MessageResponse,
    ConversationPreview,
    ChatWebSocketMessage,
)


router = APIRouter(prefix="/chat", tags=["Chat"])


# ==================== REST API ====================

@router.get("/conversations", response_model=list[ConversationPreview])
def get_conversations(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Pobierz listę konwersacji użytkownika z ostatnią wiadomością."""
    # Znajdź wszystkich użytkowników z którymi current_user wymieniał wiadomości
    subquery = (
        select(Message)
        .where(
            or_(
                Message.sender_id == current_user.id,
                Message.receiver_id == current_user.id
            )
        )
    )
    messages = session.exec(subquery).all()
    
    # Grupuj po rozmówcy
    conversations_map: dict[int, Message] = {}
    for msg in messages:
        other_user_id = msg.receiver_id if msg.sender_id == current_user.id else msg.sender_id
        # Zachowaj najnowszą wiadomość
        if other_user_id not in conversations_map or msg.created_at > conversations_map[other_user_id].created_at:
            conversations_map[other_user_id] = msg
    
    # Pobierz dane użytkowników i policz nieprzeczytane
    result = []
    for user_id, last_msg in conversations_map.items():
        other_user = session.get(User, user_id)
        if not other_user:
            continue
            
        # Policz nieprzeczytane wiadomości od tego użytkownika
        unread_count = session.exec(
            select(func.count(Message.id)).where(
                Message.sender_id == user_id,
                Message.receiver_id == current_user.id,
                Message.is_read == False
            )
        ).one()
        
        result.append(ConversationPreview(
            user_id=user_id,
            username=other_user.username,
            last_message=last_msg.content[:50] + "..." if len(last_msg.content) > 50 else last_msg.content,
            last_message_at=last_msg.created_at,
            unread_count=unread_count,
            is_online=chat_manager.is_online(user_id),
        ))
    
    # Sortuj po dacie ostatniej wiadomości (najnowsze najpierw)
    result.sort(key=lambda x: x.last_message_at, reverse=True)
    return result


@router.get("/messages/{user_id}", response_model=list[MessageResponse])
def get_messages(
    user_id: int,
    limit: int = 50,
    before: Optional[datetime] = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Pobierz historię wiadomości z konkretnym użytkownikiem."""
    # Sprawdź czy użytkownik istnieje
    other_user = session.get(User, user_id)
    if not other_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    query = select(Message).where(
        or_(
            and_(Message.sender_id == current_user.id, Message.receiver_id == user_id),
            and_(Message.sender_id == user_id, Message.receiver_id == current_user.id),
        )
    )
    
    if before:
        query = query.where(Message.created_at < before)
    
    query = query.order_by(desc(Message.created_at)).limit(limit)
    messages = session.exec(query).all()
    
    # Oznacz jako przeczytane wiadomości od drugiego użytkownika
    for msg in messages:
        if msg.sender_id == user_id and not msg.is_read:
            msg.is_read = True
            session.add(msg)
    session.commit()
    
    # Zwróć w kolejności chronologicznej
    return list(reversed(messages))


@router.post("/messages", response_model=MessageResponse)
async def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Wyślij wiadomość do użytkownika."""
    # Sprawdź czy odbiorca istnieje
    receiver = session.get(User, message_data.receiver_id)
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    if message_data.receiver_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot send message to yourself")
    
    # Utwórz wiadomość
    message = Message(
        sender_id=current_user.id,
        receiver_id=message_data.receiver_id,
        content=message_data.content,
    )
    session.add(message)
    session.commit()
    session.refresh(message)
    
    # Wyślij przez WebSocket jeśli odbiorca online
    ws_message = ChatWebSocketMessage(
        type="new_message",
        message=MessageResponse.model_validate(message),
        sender_username=current_user.username,
    )
    await chat_manager.send_to_user(
        message_data.receiver_id,
        ws_message.model_dump(mode="json")
    )
    
    return message


@router.get("/unread-count")
def get_unread_count(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Pobierz liczbę wszystkich nieprzeczytanych wiadomości."""
    count = session.exec(
        select(func.count(Message.id)).where(
            Message.receiver_id == current_user.id,
            Message.is_read == False
        )
    ).one()
    return {"unread_count": count}


@router.post("/messages/{message_id}/read")
def mark_as_read(
    message_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Oznacz wiadomość jako przeczytaną."""
    message = session.get(Message, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    if message.receiver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your message")
    
    message.is_read = True
    session.add(message)
    session.commit()
    return {"status": "ok"}


# ==================== WebSocket ====================

@router.websocket("/ws")
async def chat_websocket(
    websocket: WebSocket,
    token: str = Query(...),
):
    """
    WebSocket dla chatu w czasie rzeczywistym.
    Połącz się: ws://localhost:8000/api/v1/chat/ws?token=<JWT>
    """
    from services.db import engine
    
    # Weryfikuj token
    payload = decode_access_token(token)
    if not payload:
        await websocket.close(code=4001, reason="Invalid token")
        return
    
    user_id = payload.get("sub")
    if not user_id:
        await websocket.close(code=4001, reason="Invalid token payload")
        return
    
    user_id = int(user_id)
    
    # Sprawdź czy user istnieje (krótka sesja)
    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            await websocket.close(code=4001, reason="User not found")
            return
        username = user.username  # Zapisz przed zamknięciem sesji
    
    # Połącz
    await chat_manager.connect(user_id, websocket)
    
    try:
        while True:
            # Odbieraj wiadomości od klienta
            data = await websocket.receive_json()
            
            msg_type = data.get("type")
            
            if msg_type == "send_message":
                # Klient wysyła wiadomość przez WS
                receiver_id = data.get("receiver_id")
                content = data.get("content")
                
                if not receiver_id or not content:
                    await websocket.send_json({"type": "error", "message": "Missing receiver_id or content"})
                    continue
                
                # Użyj nowej sesji dla operacji na bazie
                with Session(engine) as session:
                    # Sprawdź odbiorcę
                    receiver = session.get(User, receiver_id)
                    if not receiver:
                        await websocket.send_json({"type": "error", "message": "Receiver not found"})
                        continue
                    
                    # Zapisz wiadomość
                    message = Message(
                        sender_id=user_id,
                        receiver_id=receiver_id,
                        content=content,
                    )
                    session.add(message)
                    session.commit()
                    session.refresh(message)
                    
                    # Przygotuj dane do wysłania
                    ws_message = {
                        "type": "new_message",
                        "message": {
                            "id": message.id,
                            "sender_id": message.sender_id,
                            "receiver_id": message.receiver_id,
                            "content": message.content,
                            "created_at": message.created_at.isoformat(),
                            "is_read": message.is_read,
                        },
                        "sender_username": username,
                    }
                
                # Wyślij do odbiorcy (poza sesją)
                await chat_manager.send_to_user(receiver_id, ws_message)
                
                # Potwierdź wysłanie nadawcy
                await websocket.send_json({
                    "type": "message_sent",
                    "message": ws_message["message"],
                })
            
            elif msg_type == "typing":
                # Powiadom drugiego użytkownika o pisaniu
                receiver_id = data.get("receiver_id")
                if receiver_id:
                    await chat_manager.send_to_user(receiver_id, {
                        "type": "typing",
                        "user_id": user_id,
                        "username": username,
                    })
            
            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        chat_manager.disconnect(user_id)
    except Exception as e:
        print(f"[Chat WS] Error for user {user_id}: {e}")
        chat_manager.disconnect(user_id)
