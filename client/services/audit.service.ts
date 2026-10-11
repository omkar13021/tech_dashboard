import axiosInstance from '@/lib/axios';

export interface AuditActor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  actorId: string;
  actor?: AuditActor | null;
  targetUserId: string | null;
  targetUser?: AuditActor | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditListResponse {
  data: AuditLogEntry[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface AuditQueryParams {
  search?: string;
  action?: string;
  entityType?: string;
  actorId?: string;
  targetUserId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export const auditApi = {
  async query(params: AuditQueryParams): Promise<AuditListResponse> {
    const res = await axiosInstance.post<AuditListResponse>('/audit/query', params);
    return res.data;
  },
  async getById(id: string): Promise<AuditLogEntry> {
    const res = await axiosInstance.get<AuditLogEntry>(`/audit/${id}`);
    return res.data;
  },
};
