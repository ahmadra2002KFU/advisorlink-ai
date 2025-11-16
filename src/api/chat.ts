import apiClient from './client';

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
  }
};
