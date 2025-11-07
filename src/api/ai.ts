import apiClient from './client';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export const aiApi = {
  chat: async (message: string, chatHistory: ChatMessage[] = []) => {
    const { data } = await apiClient.post('/ai/chat', { message, chatHistory });
    return data;
  },

  getHistory: async () => {
    const { data } = await apiClient.get('/ai/history');
    return data;
  }
};
