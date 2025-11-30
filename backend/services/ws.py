from typing import List
import asyncio

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        try:
            self.active_connections.remove(websocket)
        except ValueError:
            pass

    async def send_personal_message(self, message, websocket: WebSocket) -> None:
        await websocket.send_json(message)

    async def broadcast(self, message) -> None:
        # broadcast concurrently
        if not self.active_connections:
            return

        coros = []
        for connection in list(self.active_connections):
            try:
                coros.append(connection.send_json(message))
            except Exception:
                # will be cleaned on next disconnect
                try:
                    self.active_connections.remove(connection)
                except ValueError:
                    pass

        if coros:
            await asyncio.gather(*coros, return_exceptions=True)


# Single global manager
manager = ConnectionManager()
