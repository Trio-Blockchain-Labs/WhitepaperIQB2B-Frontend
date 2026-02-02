// Auth Types - Based on API Documentation

/**
 * User roles in the system
 * - SYSTEM_ADMIN: System-level admin with full access across all organizations (cannot be assigned via API)
 * - OWNER: Full control, cannot be removed
 * - ADMIN: Can manage users and org settings
 * - ANALYST: Can create analyses and projects
 * - VIEWER: Read-only access
 */
export type UserRole = 'SYSTEM_ADMIN' | 'OWNER' | 'ADMIN' | 'ANALYST' | 'VIEWER';

/**
 * User object from API
 */
export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
}

/**
 * Login request payload
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration request payload (for organization owner)
 */
export interface RegisterCredentials {
  organizationName: string;
  email: string;
  password: string;
  fullName?: string;
}

/**
 * Invitation acceptance payload
 */
export interface AcceptInvitationPayload {
  token: string;
  password: string;
  fullName?: string;
}

/**
 * Auth response from login/register/accept-invitation
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
  accessToken: string;
}

/**
 * Invitation details (for accept flow)
 */
export interface InvitationDetails {
  id: string;
  email: string;
  role: UserRole;
  expiresAt: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}
