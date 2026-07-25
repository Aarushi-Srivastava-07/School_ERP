import axios from 'axios';
import { clearAuthData, getStoredToken } from '../api/authService';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken() || (import.meta.env.DEV ? 'dev-mock-token' : null);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and auth failures
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hasStoredToken = getStoredToken();

      if (hasStoredToken) {
        clearAuthData();

        if (!import.meta.env.DEV) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
