import { api } from "@/services/api"; // importing the axios instance from services/api

export interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: "USER" | "AGENT" | "ADMIN";
    isOnline?: boolean;
    lastSeen?: string;
}

export interface PropertySummary {
    id: string;
    title: string;
    images?: { url: string }[];
    price?: number;
    location?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  status?: "sent" | "delivered" | "read";
  sender: UserProfile; 
}

export interface Chat {
  id: string;
  userId: string;
  agentId: string;
  propertyId: string | null;
  agent: UserProfile;
  user: UserProfile;
  property?: PropertySummary;
  updatedAt: string;
  messages: Message[];
  unreadCount?: number;
}

export interface Pagination {
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
}

export interface ChatListResponse {
    status: string;
    results: number;
    data: Chat[];
}

export interface MessageListResponse {
    status: string;
    data: {
        messages: Message[];
        pagination: Pagination;
    };
}

export const chatApi = {
  // Create or get existing chat
  createChat: async (data: { agentId: string; propertyId?: string }) => {
    // The backend route is POST /chat, payload { agentId, propertyId }
    return api.post<{ status: string; message?: string; data: Chat }>("/chat", data);
  },
  
  // List conversations with pagination
  getChats: async (params?: { page?: number; limit?: number }) => {
    return api.get<ChatListResponse>("/chat", { params });
  },
  
  // Get message history with pagination
  getMessages: async (chatId: string, params?: { page?: number; limit?: number }) => {
    return api.get<MessageListResponse>(`/chat/${chatId}/messages`, { params });
  },
  
  // Send message
  sendMessage: async (chatId: string, content: string) => {
    return api.post<{ status: string; data: Message }>(`/chat/${chatId}/messages`, { content });
  },

  // Get unread count
  getUnreadCount: async () => {
    // Note: User spec says generic "presumed active" but endpoint is consistent with others usually
    return api.get<{ status: string; data: { unreadCount: number } }>("/chat/unread-count");
  },

  // Mark message as read
  markMessageAsRead: async (messageId: string) => {
    return api.put<{ status: string; message: string }>(`/chat/messages/${messageId}/read`);
  },

  // Delete conversation
  deleteConversation: async (chatId: string) => {
    return api.delete<{ status: string; message: string }>(`/chat/conversations/${chatId}`);
  }
};

