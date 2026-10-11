import axiosInstance from '@/lib/axios';

export interface AssistantPrincipalRef {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AssistantListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  profileImage: string | null;
  lastActiveAt: string | null;
  createdAt: string;
  principalId: string | null;
  principal: AssistantPrincipalRef | null;
  grantedPermissionCount: number;
}

export interface LoginEventItem {
  id: string;
  type: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditEntryItem {
  id: string;
  action: string;
  entityType: string | null;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
}

export interface AssistantDetail {
  data: Omit<AssistantListItem, 'grantedPermissionCount'>;
  grantedPermissions: string[];
  effectivePermissions: string[];
  principalPermissions: string[];
  loginHistory?: LoginEventItem[];
  activity?: AuditEntryItem[];
}

export interface AssistantListResponse {
  data: AssistantListItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export type AssistantActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'ACTIVATE'
  | 'DEACTIVATE'
  | 'RESET_PASSWORD'
  | 'GRANT_PERMISSIONS'
  | 'REVOKE_PERMISSIONS'
  | 'DELETE';

export interface AssistantQueryParams {
  assistantId?: string;
  principalId?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  includeActivity?: boolean;
  includeLoginHistory?: boolean;
}

export interface AssistantActionRequest {
  action: AssistantActionType;
  assistantId?: string;
  payload?: Record<string, unknown>;
}

export interface AssistantActionResult {
  success: boolean;
  action: AssistantActionType;
  data?: unknown;
  message?: string;
}

export const assistantApi = {
  async query(params: AssistantQueryParams): Promise<AssistantListResponse> {
    const res = await axiosInstance.post<AssistantListResponse>('/assistants/query', params);
    return res.data;
  },
  async queryOne(assistantId: string): Promise<AssistantDetail> {
    const res = await axiosInstance.post<AssistantDetail>('/assistants/query', {
      assistantId,
      includeActivity: true,
      includeLoginHistory: true,
    });
    return res.data;
  },
  async action(request: AssistantActionRequest): Promise<AssistantActionResult> {
    const res = await axiosInstance.post<AssistantActionResult>('/assistants/action', request);
    return res.data;
  },
};
