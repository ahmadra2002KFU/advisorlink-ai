import apiClient from './client';

export interface Student {
  id: number;
  user_id: number;
  student_id: string;
  email: string;
  full_name: string;
  birthdate: string;
  level_name: string;
  level_number: number;
  section_name: string;
  gpa: number;
  attendance_percentage: number;
  has_advisor: number;
  created_at: string;
}

export interface CreateStudentData {
  email: string;
  password: string;
  fullName: string;
  studentId: string;
  birthdate: string;
  levelId: number;
  sectionId: number;
  gpa?: number;
  attendancePercentage?: number;
}

export interface UpdateStudentData {
  email?: string;
  fullName?: string;
  studentIdNumber?: string;
  birthdate?: string;
  levelId?: number;
  sectionId?: number;
  gpa?: number;
  attendancePercentage?: number;
}

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
  },

  // Student CRUD operations
  getAllStudents: async (): Promise<Student[]> => {
    const { data } = await apiClient.get('/admin/students');
    return data;
  },

  getStudent: async (studentId: number): Promise<Student> => {
    const { data } = await apiClient.get(`/admin/students/${studentId}`);
    return data;
  },

  createStudent: async (studentData: CreateStudentData): Promise<Student> => {
    const { data } = await apiClient.post('/admin/students', studentData);
    return data;
  },

  updateStudent: async (studentId: number, studentData: UpdateStudentData): Promise<Student> => {
    const { data } = await apiClient.put(`/admin/students/${studentId}`, studentData);
    return data;
  },

  deleteStudent: async (studentId: number) => {
    const { data } = await apiClient.delete(`/admin/students/${studentId}`);
    return data;
  }
};
