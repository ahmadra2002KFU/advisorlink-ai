import apiClient from './client';

export const adminApi = {
  getStats: async () => {
    const { data } = await apiClient.get('/admin/stats');
    return data;
  },

  getAllUsers: async () => {
    const { data } = await apiClient.get('/admin/users');
    return data;
  },

  getAllConversations: async () => {
    const { data } = await apiClient.get('/admin/conversations');
    return data;
  },

  getFAQs: async () => {
    const { data } = await apiClient.get('/admin/faqs');
    return data;
  },

  createFAQ: async (faq: { question: string; answer: string; category: string }) => {
    const { data } = await apiClient.post('/admin/faqs', faq);
    return data;
  },

  updateFAQ: async (faqId: number, faq: { question: string; answer: string; category: string }) => {
    const { data } = await apiClient.put(`/admin/faqs/${faqId}`, faq);
    return data;
  },

  deleteFAQ: async (faqId: number) => {
    const { data } = await apiClient.delete(`/admin/faqs/${faqId}`);
    return data;
  }
};
