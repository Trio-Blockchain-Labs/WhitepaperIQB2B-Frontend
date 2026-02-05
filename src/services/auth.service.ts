import { api, getErrorMessage } from './api';
import type { 
  User, 
  LoginCredentials, 
  RegisterCredentials,
  AcceptInvitationPayload,
  AuthResponse, 
  RefreshTokenResponse,
  InvitationDetails,
  ApiResponse
} from '../types';

// Storage keys
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/**
 * Authentication Service
 * Handles all auth-related API calls based on API Documentation
 */
export const authService = {
  /**
   * Login with email and password
   * POST /api/v1/auth/login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      
      if (response.data.success && response.data.data) {
        const { user, accessToken } = response.data.data;
        
        // Store token and user data
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        
        return response.data.data;
      }
      
      throw new Error('Login failed');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Register new organization and owner user
   * POST /api/v1/auth/register
   */
  async register(data: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
      
      if (response.data.success && response.data.data) {
        const { user, accessToken } = response.data.data;
        
        // Store token and user data
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        
        return response.data.data;
      }
      
      throw new Error('Registration failed');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get invitation details by token
   * GET /api/v1/auth/invitations/:token
   */
  async getInvitationDetails(token: string): Promise<InvitationDetails> {
    try {
      const response = await api.get<ApiResponse<InvitationDetails>>(`/auth/invitations/${token}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Invalid invitation');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Accept invitation and create user account
   * POST /api/v1/auth/invitations/accept
   */
  async acceptInvitation(data: AcceptInvitationPayload): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/invitations/accept', data);
      
      if (response.data.success && response.data.data) {
        const { user, accessToken } = response.data.data;
        
        // Store token and user data (user is automatically logged in)
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        
        return response.data.data;
      }
      
      throw new Error('Failed to accept invitation');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Refresh access token using refresh token cookie
   * POST /api/v1/auth/refresh
   */
  async refreshToken(): Promise<string | null> {
    try {
      const response = await api.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', {});
      
      if (response.data.success && response.data.data) {
        const { accessToken } = response.data.data;
        localStorage.setItem(TOKEN_KEY, accessToken);
        return accessToken;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  },

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout', {}, {
        withCredentials: true, // Include cookies to clear refresh token
      });
    } catch {
      // Ignore errors - still clear local data
    } finally {
      this.clearAuth();
      window.location.href = '/login';
    }
  },

  /**
   * Clear all auth data from storage
   */
  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Get current user from storage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get auth token from storage
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Update stored user data
   */
  updateStoredUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
};

export default authService;
