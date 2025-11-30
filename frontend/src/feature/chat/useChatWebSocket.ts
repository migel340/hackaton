import { useState, useEffect, useRef, useCallback } from "react";
import type { Message, ChatWebSocketMessage } from "@/api/chat";

// Helper do pobierania tokena z localStorage
const getAuthToken = () => localStorage.getItem("auth_token");

interface UseChatWebSocketOptions {
  onNewMessage?: (message: Message, senderUsername: string) => void;
  onMessageSent?: (message: Message) => void;
  onTyping?: (userId: number, username: string) => void;
  onError?: (error: string) => void;
}

export function useChatWebSocket(options: UseChatWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    const token = getAuthToken();
    if (!token) {
      console.log("[Chat WS] No token, skipping connection");
      return;
    }

    // Determine WebSocket URL
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    // W dev proxy nie działa dla WS, więc łączymy bezpośrednio z backendem
    const wsUrl =
      import.meta.env.DEV
        ? `ws://localhost:4000/api/v1/chat/ws?token=${token}`
        : `${protocol}//${host}/api/v1/chat/ws?token=${token}`;

    console.log("[Chat WS] Connecting to:", wsUrl.replace(token, "***"));

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[Chat WS] Connected");
      setIsConnected(true);
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data: ChatWebSocketMessage = JSON.parse(event.data);
        console.log("[Chat WS] Received:", data.type);

        if (data.type === "new_message" && data.message) {
          options.onNewMessage?.(data.message, data.sender_username || "Unknown");
        } else if (data.type === "message_sent" && data.message) {
          // Potwierdzenie wysłania - emituj zdarzenie do ChatWindow
          options.onMessageSent?.(data.message);
          // Dispatch custom event dla ChatWindow
          window.dispatchEvent(
            new CustomEvent("chat-message-sent", { detail: data.message })
          );
        } else if (data.type === "typing" && data.user_id && data.username) {
          options.onTyping?.(data.user_id, data.username);
        } else if (data.type === "error") {
          options.onError?.(String(data));
        }
      } catch (e) {
        console.error("[Chat WS] Parse error:", e);
      }
    };

    ws.onclose = (event) => {
      console.log("[Chat WS] Disconnected:", event.code, event.reason);
      setIsConnected(false);
      wsRef.current = null;

      // Auto-reconnect if not intentional close
      if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
        console.log(`[Chat WS] Reconnecting in ${delay}ms...`);
        reconnectTimeoutRef.current = window.setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, delay);
      }
    };

    ws.onerror = (error) => {
      console.error("[Chat WS] Error:", error);
    };
  }, [options]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close(1000, "User disconnect");
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((receiverId: number, content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("[Chat WS] Not connected, cannot send message");
      return false;
    }

    wsRef.current.send(
      JSON.stringify({
        type: "send_message",
        receiver_id: receiverId,
        content,
      })
    );
    return true;
  }, []);

  const sendTyping = useCallback((receiverId: number) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: "typing",
        receiver_id: receiverId,
      })
    );
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    connect,
    disconnect,
    sendMessage,
    sendTyping,
  };
}

export default useChatWebSocket;
