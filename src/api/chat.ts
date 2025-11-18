import apiClient from './client';

export interface UnreadMessage {
  id: number;
  message_text: string;
  sender_id: number;
  sender_name: string;
  conversation_id: number;
  created_at: string;
  student_number?: string;
}

export const chatApi = {
  getConversations: async () => {
    const { data } = await apiClient.get('/chat/conversations');
    return data;
  },

  createConversation: async () => {
    const { data } = await apiClient.post('/chat/conversations');
    return data;
  },

  getMessages: async (conversationId: number) => {
    const { data} = await apiClient.get(`/chat/conversations/${conversationId}/messages`);
    return data;
  },

  sendMessage: async (conversationId: number, message: string) => {
    const { data } = await apiClient.post(`/chat/conversations/${conversationId}/messages`, { message });
    return data;
  },

  markAsRead: async (messageId: number) => {
    const { data } = await apiClient.put(`/chat/messages/${messageId}/read`);
    return data;
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get('/chat/unread-count');
    return data.count;
  },

  getUnreadMessages: async (): Promise<UnreadMessage[]> => {
    const { data } = await apiClient.get('/chat/unread-messages');
    return data;
  }
};
