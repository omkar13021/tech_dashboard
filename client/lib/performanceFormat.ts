import { KpiStatus, KpiUnit, PerfRange } from '@/services/performance.service';

/** Format a metric value according to its unit. */
export function formatKpiValue(value: number, unit: KpiUnit): string {
  if (unit === '%') return `${value}%`;
  if (unit === 'days') return `${value}d`;
  return `${value}`;
}

/**
 * Client-side RAG status, mirroring the backend `statusFor` thresholds so the
 * per-member table colours match the team KPI cards. Returns null when there is
 * no target to compare against.
 */
export function kpiStatus(
  value: number,
  target: number | null | undefined,
  higherIsBetter: boolean,
): KpiStatus {
  if (target === null || target === undefined) return null;
  if (higherIsBetter) {
    if (value >= target) return 'green';
    if (value >= target * 0.8) return 'amber';
    return 'red';
  }
  if (value <= target) return 'green';
  if (value <= target * 1.25) return 'amber';
  return 'red';
}

export interface RagClasses {
  dot: string;
  border: string;
  text: string;
  badge: string;
  label: string;
}

/** Red / Amber / Green styling for a KPI status (null = no target set). */
export function ragClasses(status: KpiStatus): RagClasses {
  switch (status) {
    case 'green':
      return {
        dot: 'bg-emerald-500',
        border: 'border-l-emerald-500',
        text: 'text-emerald-700 dark:text-emerald-400',
        badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
        label: 'On target',
      };
    case 'amber':
      return {
        dot: 'bg-amber-500',
        border: 'border-l-amber-500',
        text: 'text-amber-700 dark:text-amber-400',
        badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
        label: 'At risk',
      };
    case 'red':
      return {
        dot: 'bg-rose-500',
        border: 'border-l-rose-500',
        text: 'text-rose-700 dark:text-rose-400',
        badge: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
        label: 'Off target',
      };
    default:
      return {
        dot: 'bg-slate-300 dark:bg-slate-600',
        border: 'border-l-slate-200 dark:border-l-slate-700',
        text: 'text-slate-500 dark:text-slate-400',
        badge: 'bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300',
        label: 'No target',
      };
  }
}

export const RANGE_OPTIONS: { value: PerfRange; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'month', label: 'This month' },
  { value: 'quarter', label: 'This quarter' },
  { value: 'custom', label: 'Custom range' },
];

export function rangeLabel(preset: PerfRange): string {
  return RANGE_OPTIONS.find((o) => o.value === preset)?.label ?? preset;
}

const DEPARTMENT_LABELS: Record<string, string> = {
  TECH: 'Engineering',
  MARKETING: 'Marketing',
  HR: 'People',
  SALES: 'Sales',
  OPERATIONS: 'Operations',
};

export function departmentLabel(department: string | null | undefined): string {
  if (!department) return 'All departments';
  return DEPARTMENT_LABELS[department] ?? department;
}

/* ----------------------------- chart metadata ----------------------------- */

export interface ChartMeta {
  label: string;
  /** Hex so it renders consistently inside recharts SVG (no CSS var resolution). */
  color: string;
}

export const STATUS_META: Record<string, ChartMeta> = {
  TODO: { label: 'To do', color: '#94a3b8' },
  IN_PROGRESS: { label: 'In progress', color: '#3b82f6' },
  COMPLETED: { label: 'Completed', color: '#10b981' },
  CANCELLED: { label: 'Cancelled', color: '#f43f5e' },
};

export const PRIORITY_META: Record<string, ChartMeta> = {
  LOW: { label: 'Low', color: '#94a3b8' },
  MEDIUM: { label: 'Medium', color: '#3b82f6' },
  HIGH: { label: 'High', color: '#f59e0b' },
  URGENT: { label: 'Urgent', color: '#f43f5e' },
};

export function statusMeta(key: string): ChartMeta {
  return STATUS_META[key] ?? { label: key, color: '#94a3b8' };
}

export function priorityMeta(key: string): ChartMeta {
  return PRIORITY_META[key] ?? { label: key, color: '#94a3b8' };
}

export const CHART_COLORS = {
  created: '#6366f1',
  completed: '#10b981',
  workload: '#3b82f6',
};
