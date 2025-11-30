import { api } from "./api";

// Types
export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface ConversationPreview {
  user_id: number;
  username: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  is_online: boolean;
}

export interface ChatWebSocketMessage {
  type: "new_message" | "typing" | "message_sent" | "pong" | "error";
  message?: Message;
  sender_username?: string;
  user_id?: number;
  username?: string;
}

// REST API calls
export const chatApi = {
  /**
   * Pobierz listę konwersacji
   */
  getConversations: async (): Promise<ConversationPreview[]> => {
    const response = await api.get<ConversationPreview[]>("/chat/conversations");
    return response.data;
  },

  /**
   * Pobierz wiadomości z konkretnym użytkownikiem
   */
  getMessages: async (
    userId: number,
    limit = 50,
    before?: string
  ): Promise<Message[]> => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (before) params.append("before", before);
    
    const response = await api.get<Message[]>(
      `/chat/messages/${userId}?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Wyślij wiadomość przez REST
   */
  sendMessage: async (receiverId: number, content: string): Promise<Message> => {
    const response = await api.post<Message>("/chat/messages", {
      receiver_id: receiverId,
      content,
    });
    return response.data;
  },

  /**
   * Pobierz liczbę nieprzeczytanych wiadomości
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<{ unread_count: number }>("/chat/unread-count");
    return response.data.unread_count;
  },

  /**
   * Oznacz wiadomość jako przeczytaną
   */
  markAsRead: async (messageId: number): Promise<void> => {
    await api.post(`/chat/messages/${messageId}/read`);
  },
};

export default chatApi;
