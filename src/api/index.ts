// Centralized API exports
export { authApi } from './auth';
export { studentApi } from './student';
export { advisorApi } from './advisor';
export { chatApi } from './chat';
export { aiApi } from './ai';
export { adminApi } from './admin';
export { apiClient } from './client';

export type { LoginCredentials, RegisterData, AuthResponse } from './auth';
export type { ChatMessage } from './ai';
