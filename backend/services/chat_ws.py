"""
Chat WebSocket Manager - obsługa prywatnych wiadomości w czasie rzeczywistym.
"""
from typing import Dict
import asyncio

from fastapi import WebSocket


class ChatConnectionManager:
    """Zarządza połączeniami WebSocket dla chatu prywatnego."""
    
    def __init__(self) -> None:
        # Mapowanie user_id -> WebSocket
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket) -> None:
        """Połącz użytkownika i zapisz jego WebSocket."""
        await websocket.accept()
        # Jeśli użytkownik ma już połączenie, zamknij stare
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].close()
            except Exception:
                pass
        self.active_connections[user_id] = websocket
        print(f"[Chat WS] User {user_id} connected. Total: {len(self.active_connections)}")

    def disconnect(self, user_id: int) -> None:
        """Rozłącz użytkownika."""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            print(f"[Chat WS] User {user_id} disconnected. Total: {len(self.active_connections)}")

    def is_online(self, user_id: int) -> bool:
        """Sprawdź czy użytkownik jest online."""
        return user_id in self.active_connections

    async def send_to_user(self, user_id: int, message: dict) -> bool:
        """
        Wyślij wiadomość do konkretnego użytkownika.
        Zwraca True jeśli wysłano, False jeśli użytkownik offline.
        """
        if user_id not in self.active_connections:
            return False
        
        try:
            await self.active_connections[user_id].send_json(message)
            return True
        except Exception as e:
            print(f"[Chat WS] Error sending to user {user_id}: {e}")
            # Usuń martwe połączenie
            self.disconnect(user_id)
            return False

    async def send_to_users(self, user_ids: list[int], message: dict) -> None:
        """Wyślij wiadomość do wielu użytkowników."""
        coros = [self.send_to_user(uid, message) for uid in user_ids]
        await asyncio.gather(*coros, return_exceptions=True)

    def get_online_users(self) -> list[int]:
        """Zwróć listę online user_ids."""
        return list(self.active_connections.keys())


# Globalny manager dla chatu
chat_manager = ChatConnectionManager()

__all__ = ["ChatConnectionManager", "chat_manager"]
