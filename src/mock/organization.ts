import type { Organization, OrganizationMember, MemberRole, AddMemberPayload, UpdateMemberPayload, UpdateOrganizationPayload } from '../types/organization';

// Mock Organization Data
export const mockOrganization: Organization = {
  id: 'org-001',
  name: 'Binance TR',
  subscriptionPlan: 'starter',
  billingStartDate: '2026-02-16T15:12:00Z',
  usageStats: {
    used: 60,
    total: 100,
  },
  createdAt: '2026-02-16T15:12:00Z',
  members: [
    {
      id: 'member-001',
      name: 'Kerem Kaya',
      email: 'kerem@binancetr.com',
      role: 'admin',
      status: 'active',
      isVerified: true,
      joinedAt: '2026-02-16T15:12:00Z',
    },
    {
      id: 'member-002',
      name: 'Fatih Altınışık',
      email: 'fatih@binancetr.com',
      role: 'viewer',
      status: 'active',
      isVerified: false,
      joinedAt: '2026-02-18T10:30:00Z',
    },
    {
      id: 'member-003',
      name: 'Ahmet Yılmaz',
      email: 'ahmet@binancetr.com',
      role: 'analyst',
      status: 'active',
      isVerified: true,
      joinedAt: '2026-02-20T09:00:00Z',
    },
  ],
};

// Role colors for UI
export const roleColors: Record<MemberRole, { bg: string; text: string; border: string }> = {
  owner: { bg: 'rgba(34, 197, 94, 0.15)', text: '#16a34a', border: '#22c55e' },
  admin: { bg: 'rgba(239, 68, 68, 0.15)', text: '#dc2626', border: '#ef4444' },
  analyst: { bg: 'rgba(245, 158, 11, 0.15)', text: '#d97706', border: '#f59e0b' },
  viewer: { bg: 'rgba(168, 85, 247, 0.15)', text: '#9333ea', border: '#a855f7' },
};

// Role labels
export const roleLabels: Record<MemberRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  analyst: 'Analyst',
  viewer: 'Viewer',
};

// Service-like functions (will be replaced with actual API calls)
export const getOrganization = async (): Promise<Organization> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockOrganization;
};

export const updateOrganization = async (payload: UpdateOrganizationPayload): Promise<Organization> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  if (payload.name) {
    mockOrganization.name = payload.name;
  }
  return mockOrganization;
};

export const addMember = async (payload: AddMemberPayload): Promise<OrganizationMember> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const newMember: OrganizationMember = {
    id: `member-${Date.now()}`,
    name: payload.email.split('@')[0],
    email: payload.email,
    role: payload.role,
    status: 'pending',
    isVerified: false,
    joinedAt: new Date().toISOString(),
  };
  mockOrganization.members.push(newMember);
  return newMember;
};

export const updateMember = async (payload: UpdateMemberPayload): Promise<OrganizationMember | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const member = mockOrganization.members.find(m => m.id === payload.memberId);
  if (member) {
    if (payload.role) member.role = payload.role;
    if (payload.status) member.status = payload.status;
    return member;
  }
  return null;
};

export const deleteMember = async (memberId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockOrganization.members.findIndex(m => m.id === memberId);
  if (index !== -1) {
    mockOrganization.members.splice(index, 1);
    return true;
  }
  return false;
};
