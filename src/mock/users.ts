import type { User, AuthResponse } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@whitepaperiq.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    email: 'analyst@whitepaperiq.com',
    firstName: 'Jane',
    lastName: 'Analyst',
    role: 'analyst',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: '3',
    email: 'user@whitepaperiq.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2024-02-01T00:00:00.000Z',
  },
];

// Mock credentials for testing
export const mockCredentials: Record<string, string> = {
  'admin@whitepaperiq.com': 'admin123',
  'analyst@whitepaperiq.com': 'analyst123',
  'user@whitepaperiq.com': 'user123',
};

// Simulate login response
export const getMockAuthResponse = (email: string): AuthResponse | null => {
  const user = mockUsers.find((u) => u.email === email);
  if (!user) return null;

  return {
    user,
    token: `mock-jwt-token-${user.id}-${Date.now()}`,
    refreshToken: `mock-refresh-token-${user.id}-${Date.now()}`,
  };
};
