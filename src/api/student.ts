import apiClient from './client';

export const studentApi = {
  getProfile: async () => {
    const { data } = await apiClient.get('/students/profile');
    return data;
  },

  getCourses: async () => {
    const { data } = await apiClient.get('/students/courses');
    return data;
  },

  getAdvisor: async () => {
    const { data } = await apiClient.get('/students/advisor');
    return data;
  }
};
