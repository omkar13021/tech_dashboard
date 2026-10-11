import axiosInstance from '@/lib/axios';
import { UserRole } from '@/types/auth.types';

/* ----------------------------- shared ----------------------------- */

export type Department = 'TECH' | 'MARKETING' | 'HR' | 'SALES' | 'OPERATIONS';

export const DEPARTMENTS: Department[] = [
  'TECH',
  'MARKETING',
  'HR',
  'SALES',
  'OPERATIONS',
];

export type PerfRange = '7d' | '30d' | '90d' | 'month' | 'quarter' | 'custom';

export type KpiStatus = 'green' | 'amber' | 'red' | null;

export type KpiUnit = '%' | 'days' | 'count';

export interface Kpi {
  key: string;
  label: string;
  value: number;
  previousValue: number | null;
  delta: number | null;
  unit: KpiUnit;
  higherIsBetter: boolean;
  target: number | null;
  status: KpiStatus;
}

export interface TrendPoint {
  date: string;
  created: number;
  completed: number;
}

export interface DistributionBucket {
  key: string;
  count: number;
}

export interface Distributions {
  status: DistributionBucket[];
  priority: DistributionBucket[];
}

export interface ResolvedTargets {
  completionRate: number | null;
  onTimeRate: number | null;
  maxOverdue: number | null;
  cycleTimeDays: number | null;
}

export interface WorkloadPoint {
  id: string;
  name: string;
  activeTasks: number;
}

export interface MemberRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: Department | null;
  profileImage: string | null;
  isActive: boolean;
  lastActiveAt: string | null;
  completionRate: number;
  onTimeRate: number;
  cycleAvgDays: number;
  completedTasks: number;
  activeTasks: number;
  overdueTasks: number;
}

export interface RangeMeta {
  from: string;
  to: string;
  preset: PerfRange;
}

/* ----------------------------- responses ----------------------------- */

export interface TeamDashboard {
  scope: {
    role: 'team';
    department: Department | null;
    memberCount: number;
    range: RangeMeta;
  };
  kpis: Kpi[];
  trend: TrendPoint[];
  distributions: Distributions;
  workload: WorkloadPoint[];
  members: MemberRow[];
  targets: ResolvedTargets;
}

export interface ScopedMemberInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department: Department | null;
  profileImage: string | null;
  isActive: boolean;
  lastActiveAt: string | null;
  managerId: string | null;
}

export interface RecentTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  completedAt: string | null;
  isCompleted: boolean;
  createdAt: string;
}

export interface MemberDetail {
  member: ScopedMemberInfo;
  scope: { range: RangeMeta };
  kpis: Kpi[];
  trend: TrendPoint[];
  distributions: Distributions;
  recentTasks: RecentTask[];
  targets: ResolvedTargets;
}

export interface KpiTargetRecord {
  id: string;
  scope: 'GLOBAL' | 'DEPARTMENT';
  department: Department | null;
  completionRate: number | null;
  onTimeRate: number | null;
  maxOverdue: number | null;
  cycleTimeDays: number | null;
  updatedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TargetsResponse {
  global: KpiTargetRecord | null;
  departments: KpiTargetRecord[];
  capabilities: {
    canManageGlobal: boolean;
    manageableDepartments: Department[];
  };
}

export interface PerformanceActionResult {
  success: boolean;
  action: string;
  data?: unknown;
  message?: string;
}

/* ----------------------------- params ----------------------------- */

export interface PerformanceQueryParams {
  view?: 'team' | 'member';
  memberId?: string;
  range?: PerfRange;
  from?: string;
  to?: string;
  department?: Department;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SetTargetPayload {
  scope: 'GLOBAL' | 'DEPARTMENT';
  department?: Department;
  completionRate?: number | null;
  onTimeRate?: number | null;
  maxOverdue?: number | null;
  cycleTimeDays?: number | null;
}

export interface ResetTargetPayload {
  scope: 'GLOBAL' | 'DEPARTMENT';
  department?: Department;
}

/* ----------------------------- api ----------------------------- */

export const performanceApi = {
  async teamDashboard(params: PerformanceQueryParams): Promise<TeamDashboard> {
    const res = await axiosInstance.post<TeamDashboard>('/performance/query', {
      ...params,
      view: 'team',
    });
    return res.data;
  },

  async memberDetail(params: PerformanceQueryParams): Promise<MemberDetail> {
    const res = await axiosInstance.post<MemberDetail>('/performance/query', {
      ...params,
      view: 'member',
    });
    return res.data;
  },

  async getTargets(): Promise<TargetsResponse> {
    const res = await axiosInstance.get<TargetsResponse>('/performance/targets');
    return res.data;
  },

  async setTarget(payload: SetTargetPayload): Promise<PerformanceActionResult> {
    const res = await axiosInstance.post<PerformanceActionResult>('/performance/action', {
      action: 'SET_TARGET',
      payload,
    });
    return res.data;
  },

  async resetTarget(payload: ResetTargetPayload): Promise<PerformanceActionResult> {
    const res = await axiosInstance.post<PerformanceActionResult>('/performance/action', {
      action: 'RESET_TARGET',
      payload,
    });
    return res.data;
  },
};
