export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'HOD' | 'LEAD' | 'ASSOCIATE';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  role: UserRole;
  profileImage?: string | null;
  // Dynamic RBAC additions (from /auth/me)
  roleId?: string | null;
  roleName?: string | null;
  isAssistant?: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/** Shape returned by GET /auth/me — profile + effective permission keys. */
export interface MeResponse extends User {
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  /** Effective permission keys for the current user (source of truth: backend). */
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
