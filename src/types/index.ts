// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'user' | 'analyst';

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

// Form Types
export interface FormFieldError {
  field: string;
  message: string;
}

// Common Props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Re-export crypto types
export * from './crypto';

// Re-export token types
export * from './token';

// Re-export organization types
export * from './organization';
