import axiosInstance from '@/lib/axios';

export interface RolePermission {
  key: string;
  module: string;
  action: string;
  label: string;
}

export interface RoleListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userCount: number;
  permissionCount: number;
}

export interface RoleUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  profileImage: string | null;
}

export interface RoleDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userCount: number;
  permissionKeys: string[];
  permissions: RolePermission[];
  users?: RoleUser[];
}

export interface RoleListResponse {
  data: RoleListItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export type RoleActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'CLONE'
  | 'ACTIVATE'
  | 'DEACTIVATE'
  | 'ASSIGN_PERMISSIONS';

export interface RoleQueryParams {
  roleId?: string;
  search?: string;
  isActive?: boolean;
  isSystem?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  includeUsers?: boolean;
}

export interface RoleActionRequest {
  action: RoleActionType;
  roleId?: string;
  payload?: Record<string, unknown>;
}

export interface RoleActionResult {
  success: boolean;
  action: RoleActionType;
  data?: unknown;
  message?: string;
}

export const roleApi = {
  async query(params: RoleQueryParams): Promise<RoleListResponse> {
    const res = await axiosInstance.post<RoleListResponse>('/roles/query', params);
    return res.data;
  },
  async queryOne(roleId: string, includeUsers = true): Promise<RoleDetail> {
    const res = await axiosInstance.post<RoleDetail>('/roles/query', { roleId, includeUsers });
    return res.data;
  },
  async action(request: RoleActionRequest): Promise<RoleActionResult> {
    const res = await axiosInstance.post<RoleActionResult>('/roles/action', request);
    return res.data;
  },
};
