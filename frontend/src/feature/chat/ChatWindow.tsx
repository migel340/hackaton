import { useState, useEffect, useRef } from "react";
import { chatApi, type Message } from "@/api/chat";

interface ChatWindowProps {
  userId: number;
  username: string;
  onClose: () => void;
  newMessageFromWs?: Message | null;
}

export function ChatWindow({
  userId,
  username,
  onClose,
  newMessageFromWs,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Dodaj nową wiadomość z WebSocket
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

    try {
      setIsSending(true);
      const sent = await chatApi.sendMessage(userId, newMessage.trim());
      setMessages((prev) => [...prev, sent]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

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
        <div className="flex items-center gap-2">
          <div className="avatar placeholder">
            <div className="bg-primary-content text-primary rounded-full w-8">
              <span className="text-sm">{username[0]?.toUpperCase()}</span>
            </div>
          </div>
          <span className="font-semibold">{username}</span>
        </div>
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
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat ${
                msg.sender_id === userId ? "chat-start" : "chat-end"
              }`}
            >
              <div
                className={`chat-bubble ${
                  msg.sender_id === userId
                    ? "chat-bubble-neutral"
                    : "chat-bubble-primary"
                }`}
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
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-base-300">
        <div className="flex gap-2">
          <input
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
