import apiClient from './client';

export const advisorApi = {
  getProfile: async () => {
    const { data } = await apiClient.get('/advisors/profile');
    return data;
  },

  getAssignedStudents: async () => {
    const { data } = await apiClient.get('/advisors/students');
    return data;
  },

  getStats: async () => {
    const { data } = await apiClient.get('/advisors/stats');
    return data;
  },

  updateAvailability: async (isAvailable: boolean) => {
    const { data } = await apiClient.put('/advisors/availability', { isAvailable });
    return data;
  }
};
