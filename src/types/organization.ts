// Organization Types - Based on API Documentation

import type { UserRole, User } from './auth.types';

/**
 * Organization subscription plans
 */
export type Plan = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';

/**
 * Organization status
 */
export type OrgStatus = 'PENDING_SETUP' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

/**
 * Organization credits information
 */
export interface OrganizationCredits {
  total: number;
  used: number;
  remaining: number;
}

/**
 * Organization billing information
 */
export interface OrganizationBilling {
  cycleStart: string;
}

/**
 * Organization object from API
 */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  status: OrgStatus;
  credits: OrganizationCredits;
  billing: OrganizationBilling;
  createdAt: string;
}

/**
 * Organization member (same as User from auth)
 */
export type OrganizationMember = User;

/**
 * Pending invitation
 */
export interface PendingInvitation {
  id: string;
  email: string;
  role: UserRole;
  expiresAt: string;
  createdAt: string;
}

/**
 * Created invitation (includes token)
 */
export interface CreatedInvitation extends PendingInvitation {
  token: string;
}

/**
 * Organization members response
 */
export interface OrganizationMembersResponse {
  users: OrganizationMember[];
  pendingInvitations: PendingInvitation[];
}

/**
 * Update organization payload
 */
export interface UpdateOrganizationPayload {
  name?: string;
}

/**
 * Invite member payload
 */
export interface InviteMemberPayload {
  email: string;
  role: UserRole;
}

/**
 * Update member payload
 */
export interface UpdateMemberPayload {
  role?: UserRole;
  isActive?: boolean;
}

// Re-export UserRole for convenience
export type { UserRole } from './auth.types';

// UI Helpers - Role colors for display
export const roleColors: Record<UserRole, { bg: string; text: string; border: string }> = {
  SYSTEM_ADMIN: { bg: 'rgba(59, 130, 246, 0.15)', text: '#2563eb', border: '#3b82f6' },
  OWNER: { bg: 'rgba(34, 197, 94, 0.15)', text: '#16a34a', border: '#22c55e' },
  ADMIN: { bg: 'rgba(239, 68, 68, 0.15)', text: '#dc2626', border: '#ef4444' },
  ANALYST: { bg: 'rgba(245, 158, 11, 0.15)', text: '#d97706', border: '#f59e0b' },
  VIEWER: { bg: 'rgba(168, 85, 247, 0.15)', text: '#9333ea', border: '#a855f7' },
};

// UI Helpers - Role labels for display
export const roleLabels: Record<UserRole, string> = {
  SYSTEM_ADMIN: 'System Admin',
  OWNER: 'Owner',
  ADMIN: 'Admin',
  ANALYST: 'Analyst',
  VIEWER: 'Viewer',
};

// UI Helpers - Status colors
export const statusColors: Record<OrgStatus, { bg: string; text: string }> = {
  PENDING_SETUP: { bg: 'rgba(245, 158, 11, 0.15)', text: '#d97706' },
  ACTIVE: { bg: 'rgba(34, 197, 94, 0.15)', text: '#16a34a' },
  SUSPENDED: { bg: 'rgba(239, 68, 68, 0.15)', text: '#dc2626' },
  ARCHIVED: { bg: 'rgba(107, 114, 128, 0.15)', text: '#6b7280' },
};

// UI Helpers - Plan labels
export const planLabels: Record<Plan, string> = {
  FREE: 'Free',
  STARTER: 'Starter',
  PRO: 'Professional',
  ENTERPRISE: 'Enterprise',
};
