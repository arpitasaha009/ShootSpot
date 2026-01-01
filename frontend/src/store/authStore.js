import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Initialize auth state
  initialize: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      // Verify token is valid
      await api.get('/users/profile');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      // Token is invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    }
  },

  // Login
  login: async (email, password) => {
    try {
      set({ error: null });
      const response = await api.post('/auth/login', { email, password });
      
      const { accessToken, refreshToken, user } = response.data;
      
      // Store tokens
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      set({ 
        user, 
        isAuthenticated: true,
        error: null 
      });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message });
      return { success: false, message };
    }
  },

  // Register
  register: async (userData) => {
    try {
      set({ error: null });
      const response = await api.post('/auth/register', userData);
      
      set({ 
        error: null 
      });
      
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      set({ error: message });
      return { success: false, message };
    }
  },

  // Logout
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state regardless of API call result
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      delete api.defaults.headers.common['Authorization'];
      
      set({ 
        user: null, 
        isAuthenticated: false,
        error: null 
      });
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      set({ error: null });
      const response = await api.put('/users/profile', profileData);
      
      const updatedUser = { ...get().user, ...response.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      set({ user: updatedUser });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      set({ error: message });
      return { success: false, message };
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await api.post('/auth/refresh-token', { refreshToken });
      const { accessToken } = response.data;

      localStorage.setItem('token', accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      return true;
    } catch (error) {
      get().logout();
      return false;
    }
  },

  // Clear error
  clearError: () => set({ error: null })
}));

// Setup axios interceptor for token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const success = await useAuthStore.getState().refreshToken();
        if (success) {
          originalRequest.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default useAuthStore;
