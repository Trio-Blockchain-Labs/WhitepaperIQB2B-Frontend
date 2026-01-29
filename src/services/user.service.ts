import { api, getErrorMessage } from './api';
import type { ApiResponse, User } from '../types';

/**
 * User Service
 * Handles user-related API calls based on API Documentation
 */
export const userService = {
  /**
   * Get current user profile
   * GET /api/v1/users/me
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>('/users/me');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Failed to fetch user profile');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Update current user profile
   * PATCH /api/v1/users/me
   */
  async updateProfile(payload: { fullName?: string }): Promise<User> {
    try {
      const response = await api.patch<ApiResponse<User>>('/users/me', payload);
      
      if (response.data.success && response.data.data) {
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
      }
      
      throw new Error('Failed to update profile');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

export default userService;
