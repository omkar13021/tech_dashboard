import axiosInstance from '@/lib/axios';
import { UserRole } from '@/types/auth.types';
import {
  Department,
  ManagedUser,
  UserActionType,
  UserActivityEntry,
  UserActivityType,
  UserDirectoryStats,
  UserWorkStats,
} from '@/types/user.types';

/* ------------------------------------------------------------------ */
/* Raw API shapes (POST /users/query, POST /users/action)              */
/* ------------------------------------------------------------------ */

export interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  profileImage: string | null;
  department: Department | null;
  jobTitle: string | null;
  phone: string | null;
  location: string | null;
  managerId: string | null;
  createdAt: string;
  updatedAt: string;
  manager: { id: string; firstName: string; lastName: string; role: UserRole } | null;
}

interface AuditMetadata {
  from?: string | null;
  to?: string | null;
  fields?: string[];
  [key: string]: unknown;
}

interface ApiAuditEntry {
  id: string;
  action: UserActivityType;
  createdAt: string;
  metadata?: AuditMetadata | null;
  actor?: { id: string; firstName: string; lastName: string } | null;
}

export interface UserListApiResponse {
  data: ApiUser[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  stats?: UserDirectoryStats;
  facets?: { managers: { id: string; name: string }[] };
}

export interface UserDetailApiResponse {
  data: ApiUser;
  activity?: ApiAuditEntry[];
  taskStats?: UserWorkStats;
}

export interface UserQueryParams {
  userId?: string;
  search?: string;
  role?: UserRole[];
  department?: Department;
  managerId?: string;
  isActive?: boolean;
  sortBy?: 'createdAt' | 'firstName' | 'lastName' | 'role' | 'department';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  includeStats?: boolean;
  includeActivity?: boolean;
}

export interface UserActionRequest {
  action: UserActionType;
  userId?: string;
  payload?: Record<string, unknown>;
}

export interface UserActionApiResult {
  success: boolean;
  action: UserActionType;
  data?: unknown;
  message?: string;
}

/* ------------------------------------------------------------------ */
/* Mappers (API → UI)                                                  */
/* ------------------------------------------------------------------ */

export function mapApiUser(api: ApiUser): ManagedUser {
  return {
    id: api.id,
    firstName: api.firstName,
    lastName: api.lastName,
    email: api.email,
    role: api.role,
    department: api.department,
    managerId: api.managerId,
    managerName: api.manager
      ? `${api.manager.firstName} ${api.manager.lastName}`
      : null,
    isActive: api.isActive,
    status: api.isActive ? 'ACTIVE' : 'INACTIVE',
    profileImage: api.profileImage,
    jobTitle: api.jobTitle,
    phone: api.phone,
    location: api.location,
    createdAt: api.createdAt,
  };
}

const ACTIVITY_TITLES: Record<UserActivityType, string> = {
  CREATE_USER: 'Account created',
  UPDATE_USER: 'Profile updated',
  DELETE_USER: 'Account deleted',
  ACTIVATE_USER: 'Account activated',
  DEACTIVATE_USER: 'Account deactivated',
  RESET_PASSWORD: 'Password reset',
  ROLE_CHANGE: 'Role changed',
  DEPARTMENT_CHANGE: 'Department changed',
  MANAGER_CHANGE: 'Manager changed',
};

function describeAudit(entry: ApiAuditEntry): string | undefined {
  const m = entry.metadata;
  if (!m) return undefined;
  if (entry.action === 'ROLE_CHANGE' && (m.from || m.to)) {
    return `${m.from ?? '—'} → ${m.to ?? '—'}`;
  }
  if (entry.action === 'DEPARTMENT_CHANGE') {
    return `${m.from ?? '—'} → ${m.to ?? '—'}`;
  }
  if (entry.action === 'UPDATE_USER' && Array.isArray(m.fields) && m.fields.length) {
    return `Updated: ${m.fields.join(', ')}`;
  }
  return undefined;
}

export function mapAuditEntry(entry: ApiAuditEntry): UserActivityEntry {
  return {
    id: entry.id,
    type: entry.action,
    title: ACTIVITY_TITLES[entry.action] ?? entry.action,
    description: describeAudit(entry),
    timestamp: entry.createdAt,
    actor: entry.actor ? `${entry.actor.firstName} ${entry.actor.lastName}` : undefined,
  };
}

/* ------------------------------------------------------------------ */
/* Single user API service — query() + action()                        */
/* ------------------------------------------------------------------ */

export const userApi = {
  async query(params: UserQueryParams): Promise<UserListApiResponse> {
    const response = await axiosInstance.post<UserListApiResponse>(
      '/users/query',
      params,
    );
    return response.data;
  },

  async queryOne(userId: string): Promise<UserDetailApiResponse> {
    const response = await axiosInstance.post<UserDetailApiResponse>('/users/query', {
      userId,
      includeActivity: true,
    });
    return response.data;
  },

  async action(request: UserActionRequest): Promise<UserActionApiResult> {
    const response = await axiosInstance.post<UserActionApiResult>(
      '/users/action',
      request,
    );
    return response.data;
  },
};
