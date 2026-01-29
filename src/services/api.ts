import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Base URL from environment
// API Documentation states: Base URL is /api/v1
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (import.meta.env.VITE_APP_ENV === 'development') {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle specific error cases
    if (error.response) {
      const status = error.response.status;
      const requestUrl = error.config?.url || '';
      
      // Check if this is an auth endpoint (login, register, etc.)
      const isAuthEndpoint = requestUrl.includes('/auth/');
      
      switch (status) {
        case 401:
          // Only redirect to login if NOT on an auth endpoint
          // This prevents redirect loop when login fails
          if (!isAuthEndpoint) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
          break;
        case 403:
          // Forbidden
          console.error('[API] Access forbidden');
          break;
        case 404:
          // Not found
          console.error('[API] Resource not found');
          break;
        case 500:
          // Server error
          console.error('[API] Server error');
          break;
        default:
          console.error(`[API] Error: ${status}`);
      }
    } else if (error.request) {
      // Network error - no response received
      console.error('[API] Network error - no response received');
    } else {
      console.error('[API] Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API Error type
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

// Helper to extract error message
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    return axiosError.response?.data?.message || axiosError.message || 'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Health check function
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get('/');
    return response.status === 200;
  } catch {
    return false;
  }
};

export default api;
