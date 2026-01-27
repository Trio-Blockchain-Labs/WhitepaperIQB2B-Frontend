// Organization Types

export type MemberRole = 'owner' | 'admin' | 'analyst' | 'viewer';

export type MemberStatus = 'active' | 'inactive' | 'pending';

export interface OrganizationMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  isVerified: boolean;
  joinedAt: string;
  avatar?: string;
}

export type SubscriptionPlan = 'starter' | 'professional' | 'enterprise';

export interface Organization {
  id: string;
  name: string;
  subscriptionPlan: SubscriptionPlan;
  billingStartDate: string;
  usageStats: {
    used: number;
    total: number;
  };
  createdAt: string;
  members: OrganizationMember[];
}

export interface AddMemberPayload {
  email: string;
  role: MemberRole;
}

export interface UpdateMemberPayload {
  memberId: string;
  role?: MemberRole;
  status?: MemberStatus;
}

export interface UpdateOrganizationPayload {
  name?: string;
}
