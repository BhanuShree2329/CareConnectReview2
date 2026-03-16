import { api } from './api';

export const authService = {
  // Use this for your Registration page
  register: async (userData: any) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  // Use this for your Login page
  login: async (credentials: any) => {
    const response = await api.post('/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Admin: Get users waiting for approval
  getPendingUsers: async () => {
    const response = await api.get('/users/pending');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};