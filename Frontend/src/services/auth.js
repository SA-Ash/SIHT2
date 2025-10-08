import api from './api.js';

// Auth service for authentication endpoints
export const authService = {
  initiatePhoneOTP: async (phone) => {
    const response = await api.post('/api/auth/phone/initiate', { phone });
    return response.data;
  },

  verifyPhoneOTP: async (phone, code, college) => {
    const response = await api.post('/api/auth/phone/verify', { phone, code, college });
    const { accessToken, refreshToken, user } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  googleAuth: async (idToken) => {
    const response = await api.post('/api/auth/google', { idToken });
    const { accessToken, refreshToken, user } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  initiateCollegeAuth: async (email) => {
    const response = await api.post('/api/auth/college', { email });
    return response.data;
  },

  verifyCollegeAuth: async (email, code) => {
    const response = await api.post('/api/auth/college', { email, code });
    const { accessToken, refreshToken, user } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },
  getAccessToken: () => {
    return localStorage.getItem('accessToken');
  },
};
