import { useState, useEffect, useRef } from "react";
import { chatApi, type Message } from "@/api/chat";
import { signalTypeColors } from "@/feature/signals/radar/signalTypeColors";

interface ChatWindowProps {
  userId: number;
  username: string;
  onClose: () => void;
  newMessageFromWs?: Message | null;
  /** WebSocket send function - if provided, messages will be sent via WS */
  onSendViaWs?: (receiverId: number, content: string) => boolean;
  /** Signal type for color coding */
  signalType?: string;
}

export function ChatWindow({
  userId,
  username,
  onClose,
  newMessageFromWs,
  onSendViaWs,
  signalType,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus na input po otwarciu
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Pobierz historię wiadomości
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const data = await chatApi.getMessages(userId);
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [userId]);

  // Dodaj nową wiadomość z WebSocket (otrzymane od innego użytkownika)
  useEffect(() => {
    if (newMessageFromWs && newMessageFromWs.sender_id === userId) {
      setMessages((prev) => [...prev, newMessageFromWs]);
    }
  }, [newMessageFromWs, userId]);

  // Scroll do dołu przy nowych wiadomościach
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    const content = newMessage.trim();
    console.log("[ChatWindow] Sending message:", { userId, content, hasWs: !!onSendViaWs });

    // Spróbuj wysłać przez WebSocket jeśli dostępny
    if (onSendViaWs) {
      const sent = onSendViaWs(userId, content);
      console.log("[ChatWindow] WS send result:", sent);
      if (sent) {
        setIsSending(true);
        setNewMessage("");
        // Timeout na wypadek braku odpowiedzi
        setTimeout(() => {
          setIsSending(false);
        }, 5000);
        return;
      }
    }

    // Fallback do REST API
    console.log("[ChatWindow] Using REST API fallback");
    try {
      setIsSending(true);
      const sent = await chatApi.sendMessage(userId, content);
      console.log("[ChatWindow] REST API response:", sent);
      setMessages((prev) => [...prev, sent]);
      setNewMessage("");
    } catch (error) {
      console.error("[ChatWindow] Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Funkcja do dodania wysłanej wiadomości (wywoływana z zewnątrz po potwierdzeniu WS)
  const addSentMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
    setIsSending(false);
  };

  // Eksportuj funkcję przez ref lub callback
  useEffect(() => {
    // Expose addSentMessage to parent via custom event pattern
    const handler = (e: CustomEvent<Message>) => {
      if (e.detail.receiver_id === userId) {
        addSentMessage(e.detail);
      }
    };
    window.addEventListener('chat-message-sent' as any, handler as EventListener);
    return () => window.removeEventListener('chat-message-sent' as any, handler as EventListener);
  }, [userId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 sm:w-96 h-[28rem] bg-base-100 rounded-lg shadow-2xl flex flex-col border border-base-300 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-base-300 bg-primary text-primary-content rounded-t-lg">
        <span className="font-semibold">{username}</span>
        <button
          onClick={onClose}
          className="btn btn-ghost btn-sm btn-circle text-primary-content"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-base-content/50 mt-8">
            Brak wiadomości. Rozpocznij konwersację!
          </div>
        ) : (
          messages.map((msg) => {
            // Kolor dla wiadomości od rozmówcy (bazuje na jego signalType)
            const otherUserBubbleStyle = signalType && signalTypeColors[signalType]
              ? { backgroundColor: signalTypeColors[signalType], color: 'white' }
              : undefined;
            
            return (
            <div
              key={msg.id}
              className={`chat ${
                msg.sender_id === userId ? "chat-start" : "chat-end"
              }`}
            >
              <div
                className={`chat-bubble ${
                  msg.sender_id === userId
                    ? ""
                    : "bg-base-300 text-base-content"
                }`}
                style={msg.sender_id === userId ? otherUserBubbleStyle : undefined}
              >
                {msg.content}
              </div>
              <div className="chat-footer opacity-50 text-xs">
                {new Date(msg.created_at).toLocaleTimeString("pl-PL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-base-300">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Napisz wiadomość..."
            className="input input-bordered input-sm flex-1"
            disabled={isSending}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="btn btn-primary btn-sm"
          >
            {isSending ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              "Wyślij"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
