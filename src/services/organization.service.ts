import { api, getErrorMessage } from './api';
import type { ApiResponse } from '../types';
import type {
  Organization,
  OrganizationMembersResponse,
  OrganizationMember,
  UpdateOrganizationPayload,
  InviteMemberPayload,
  UpdateMemberPayload,
} from '../types/organization';

/**
 * Organization Service
 * Handles all organization-related API calls based on API Documentation
 */
export const organizationService = {
  /**
   * Get current organization
   * GET /api/v1/organization
   */
  async getOrganization(): Promise<Organization> {
    try {
      const response = await api.get<ApiResponse<Organization>>('/organization');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Failed to fetch organization');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Update organization
   * PATCH /api/v1/organization
   */
  async updateOrganization(payload: UpdateOrganizationPayload): Promise<Organization> {
    try {
      const response = await api.patch<ApiResponse<Organization>>('/organization', payload);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Failed to update organization');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * List organization members and pending invitations
   * GET /api/v1/organization/members
   */
  async getMembers(): Promise<OrganizationMembersResponse> {
    try {
      const response = await api.get<ApiResponse<OrganizationMembersResponse>>('/organization/members');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Failed to fetch members');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Invite user to organization
   * POST /api/v1/organization/members
   *
   * Backend response example:
   * {
   *   success: true,
   *   message: "Invitation created and sent successfully"
   * }
   */
  async inviteMember(payload: InviteMemberPayload): Promise<void> {
    try {
      const response = await api.post<ApiResponse<unknown>>('/organization/members', payload);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create invitation');
      }
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Update organization member
   * PATCH /api/v1/organization/members/:memberId
   */
  async updateMember(memberId: string, payload: UpdateMemberPayload): Promise<OrganizationMember> {
    try {
      const response = await api.patch<ApiResponse<OrganizationMember>>(
        `/organization/members/${memberId}`,
        payload
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Failed to update member');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Remove organization member
   * DELETE /api/v1/organization/members/:memberId
   */
  async removeMember(memberId: string): Promise<OrganizationMember> {
    try {
      const response = await api.delete<ApiResponse<OrganizationMember>>(
        `/organization/members/${memberId}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Failed to remove member');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Generate invite link from token
   */
  getInviteLink(token: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/invite/${token}`;
  },
};

export default organizationService;
