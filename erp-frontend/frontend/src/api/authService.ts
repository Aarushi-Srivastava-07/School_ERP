import apiClient from './client';
import { API_ROUTES } from './routes';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    access_token: string;
    user: {
      id: string;
      email: string;
      role: string;
      [key: string]: any;
    };
  };
}

export interface User {
  id?: string;
  email?: string;
  role: string;
  [key: string]: any;
}

const AUTH_STORAGE_KEYS = ['token', 'access_token', 'authToken'] as const;

export const setAuthData = (token: string | null, user?: User | null, rememberMe = true): void => {
  if (!token) {
    clearAuthData();
    return;
  }

  AUTH_STORAGE_KEYS.forEach((key) => localStorage.setItem(key, token));

  if (rememberMe && user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

export const getStoredToken = (): string | null => {
  for (const key of AUTH_STORAGE_KEYS) {
    const value = localStorage.getItem(key);
    if (value) {
      return value;
    }
  }

  return null;
};

/**
 * Login user and store access token
 * POST /api/auth/login
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post(API_ROUTES.auth.login, credentials);
    
    const accessToken = response.data?.data?.access_token ?? response.data?.access_token;

    if (accessToken) {
      setAuthData(accessToken, response.data?.data?.user ?? null, true);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

/**
 * Logout user and clear access token
 * POST /api/auth/logout
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post(API_ROUTES.auth.logout);
  } catch (error) {
    console.error('Error during logout:', error);
    // Continue with local cleanup even if API call fails
  } finally {
    clearAuthData();
  }
};

/**
 * Get current authenticated user details
 * GET /api/auth/me
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await apiClient.get(API_ROUTES.auth.me);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

/**
 * Get stored access token from localStorage
 */
export const getAccessToken = (): string | null => {
  return getStoredToken();
};

/**
 * Get stored user data from localStorage
 */
export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  }
  return null;
};

/**
 * Clear authentication data from localStorage
 */
export const clearAuthData = (): void => {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem('user');
};
