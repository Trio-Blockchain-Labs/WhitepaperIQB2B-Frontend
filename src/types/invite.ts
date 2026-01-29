// Invite Types - Based on API Documentation

import type { UserRole } from './auth.types';

/**
 * Invitation details from API
 * GET /api/v1/auth/invitations/:token
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
 * Accept invitation payload
 * POST /api/v1/auth/invitations/accept
 */
export interface AcceptInvitationPayload {
  token: string;
  password: string;
  fullName?: string;
}
