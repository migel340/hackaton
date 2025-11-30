import { useState, useEffect } from "react";
import { chatApi, type ConversationPreview, type Message } from "@/api/chat";
import { ChatWindow } from "./ChatWindow";
import { useChatWebSocket } from "./useChatWebSocket";

interface ChatNotificationBadgeProps {
  className?: string;
}

export function ChatNotificationBadge({ className }: ChatNotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<{
    userId: number;
    username: string;
  } | null>(null);
  const [latestWsMessage, setLatestWsMessage] = useState<Message | null>(null);

  // WebSocket dla powiadomień o nowych wiadomościach
  const { isConnected, sendMessage: sendMessageViaWs } = useChatWebSocket({
    onNewMessage: (message, senderUsername) => {
      console.log("[Chat] New message from:", senderUsername);
      
      // Aktualizuj licznik nieprzeczytanych jeśli nie mamy otwartego chatu z tym użytkownikiem
      if (!activeChat || activeChat.userId !== message.sender_id) {
        setUnreadCount((prev) => prev + 1);
        
        // Aktualizuj listę konwersacji
        setConversations((prev) => {
          const existingIdx = prev.findIndex((c) => c.user_id === message.sender_id);
          if (existingIdx >= 0) {
            const updated = [...prev];
            updated[existingIdx] = {
              ...updated[existingIdx],
              last_message: message.content.slice(0, 50),
              last_message_at: message.created_at,
              unread_count: updated[existingIdx].unread_count + 1,
            };
            // Przenieś na górę
            const [conv] = updated.splice(existingIdx, 1);
            return [conv, ...updated];
          } else {
            // Nowa konwersacja
            return [
              {
                user_id: message.sender_id,
                username: senderUsername,
                last_message: message.content.slice(0, 50),
                last_message_at: message.created_at,
                unread_count: 1,
                is_online: true,
              },
              ...prev,
            ];
          }
        });
      } else {
        // Mamy otwarty chat z tym użytkownikiem - przekaż wiadomość
        setLatestWsMessage(message);
      }
    },
    onMessageSent: (message) => {
      console.log("[Chat] Message sent confirmation:", message.id);
      // Aktualizuj listę konwersacji po wysłaniu wiadomości
      setConversations((prev) => {
        const existingIdx = prev.findIndex((c) => c.user_id === message.receiver_id);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            last_message: message.content.slice(0, 50),
            last_message_at: message.created_at,
          };
          // Przenieś na górę
          const [conv] = updated.splice(existingIdx, 1);
          return [conv, ...updated];
        }
        return prev;
      });
    },
  });

  // Pobierz liczbę nieprzeczytanych na start
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const count = await chatApi.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };
    fetchUnread();
  }, []);

  // Pobierz konwersacje gdy otwieramy dropdown
  useEffect(() => {
    if (isOpen) {
      const fetchConversations = async () => {
        try {
          const data = await chatApi.getConversations();
          setConversations(data);
        } catch (error) {
          console.error("Error fetching conversations:", error);
        }
      };
      fetchConversations();
    }
  }, [isOpen]);

  const handleOpenChat = (userId: number, username: string) => {
    setActiveChat({ userId, username });
    setIsOpen(false);
    
    // Zmniejsz licznik nieprzeczytanych dla tej konwersacji
    const conv = conversations.find((c) => c.user_id === userId);
    if (conv && conv.unread_count > 0) {
      setUnreadCount((prev) => Math.max(0, prev - conv.unread_count));
      setConversations((prev) =>
        prev.map((c) =>
          c.user_id === userId ? { ...c, unread_count: 0 } : c
        )
      );
    }
  };

  const handleCloseChat = () => {
    setActiveChat(null);
    setLatestWsMessage(null);
  };

  return (
    <>
      {/* Notification Badge */}
      <div className={`dropdown dropdown-end ${className}`}>
        <div
          tabIndex={0}
          role="button"
          className="btn btn-ghost btn-circle"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="indicator">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="badge badge-sm badge-primary indicator-item">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        </div>

        {isOpen && (
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-80 p-2 shadow-lg border border-base-300"
          >
            <li className="menu-title flex flex-row justify-between items-center">
              <span>Wiadomości</span>
              {isConnected ? (
                <span className="badge badge-success badge-xs">online</span>
              ) : (
                <span className="badge badge-error badge-xs">offline</span>
              )}
            </li>

            {conversations.length === 0 ? (
              <li className="p-4 text-center text-base-content/50">
                Brak konwersacji
              </li>
            ) : (
              conversations.map((conv) => (
                <li key={conv.user_id}>
                  <a
                    onClick={() => handleOpenChat(conv.user_id, conv.username)}
                    className="flex items-center gap-3"
                  >
                    <div className="avatar placeholder">
                      <div
                        className={`w-10 rounded-full ${
                          conv.is_online
                            ? "bg-success text-success-content"
                            : "bg-base-300 text-base-content"
                        }`}
                      >
                        <span>{conv.username[0]?.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold truncate">
                          {conv.username}
                        </span>
                        {conv.unread_count > 0 && (
                          <span className="badge badge-primary badge-sm">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-base-content/60 truncate">
                        {conv.last_message}
                      </p>
                    </div>
                  </a>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {/* Active Chat Window */}
      {activeChat && (
        <ChatWindow
          userId={activeChat.userId}
          username={activeChat.username}
          onClose={handleCloseChat}
          newMessageFromWs={latestWsMessage}
          onSendViaWs={isConnected ? sendMessageViaWs : undefined}
        />
      )}
    </>
  );
}

export default ChatNotificationBadge;
