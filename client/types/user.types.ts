import { UserRole } from './auth.types';

/**
 * Domain types for the User Management module.
 *
 * These mirror the backend contract (POST /users/query and /users/action):
 * Department is an enum, status is derived from `isActive`, and the activity
 * timeline is driven by audit-log actions.
 */

export type Department = 'TECH' | 'MARKETING' | 'HR' | 'SALES' | 'OPERATIONS';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export const DEPARTMENT_LABELS: Record<Department, string> = {
  TECH: 'Tech',
  MARKETING: 'Marketing',
  HR: 'HR',
  SALES: 'Sales',
  OPERATIONS: 'Operations',
};

export const DEPARTMENT_OPTIONS: { value: Department; label: string }[] = (
  Object.keys(DEPARTMENT_LABELS) as Department[]
).map((value) => ({ value, label: DEPARTMENT_LABELS[value] }));

export function departmentLabel(dept: Department | null | undefined): string {
  return dept ? DEPARTMENT_LABELS[dept] : '—';
}

/** Audit-log action types, matching the backend AuditAction enum. */
export type UserActivityType =
  | 'CREATE_USER'
  | 'UPDATE_USER'
  | 'DELETE_USER'
  | 'ACTIVATE_USER'
  | 'DEACTIVATE_USER'
  | 'RESET_PASSWORD'
  | 'ROLE_CHANGE'
  | 'DEPARTMENT_CHANGE'
  | 'MANAGER_CHANGE';

export interface UserActivityEntry {
  id: string;
  type: UserActivityType;
  title: string;
  description?: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  actor?: string;
}

export interface UserWorkStats {
  assignedProjects: number;
  assignedTasks: number;
  completedTasks: number;
  upcomingMeetings: number;
}

/** Summary counts for the stats cards (computed server-side, role-scoped). */
export interface UserDirectoryStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
}

/** The UI-facing user shape (mapped from the API response). */
export interface ManagedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department: Department | null;
  managerId: string | null;
  managerName: string | null;
  isActive: boolean;
  /** Derived from isActive for the existing badge components. */
  status: UserStatus;
  profileImage?: string | null;
  jobTitle?: string | null;
  phone?: string | null;
  location?: string | null;
  createdAt: string;
  // Detail-view extras
  stats?: UserWorkStats;
  activity?: UserActivityEntry[];
}

/** Payload produced by the create/edit form. */
export interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  department: Department | null;
  managerId: string | null;
  status: UserStatus;
  jobTitle: string;
  phone: string;
  location: string;
  profileImage: string | null;
}

/** Mutation action types, matching the backend UserActionType enum. */
export type UserActionType =
  | 'CREATE_USER'
  | 'UPDATE_USER'
  | 'DELETE_USER'
  | 'ACTIVATE_USER'
  | 'DEACTIVATE_USER'
  | 'RESET_PASSWORD'
  | 'ASSIGN_ROLE'
  | 'ASSIGN_DEPARTMENT'
  | 'ASSIGN_MANAGER';

/* ------------------------------------------------------------------ */
/* Role display metadata                                               */
/* ------------------------------------------------------------------ */

export interface RoleMeta {
  label: string;
  description: string;
  badgeClass: string;
}

export const ROLE_META: Record<UserRole, RoleMeta> = {
  SUPERADMIN: {
    label: 'Super Admin',
    description: 'Full platform access across all companies',
    badgeClass:
      'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20',
  },
  ADMIN: {
    label: 'Admin',
    description: 'Manages users, departments and projects',
    badgeClass:
      'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20',
  },
  HOD: {
    label: 'Head of Dept',
    description: 'Leads an entire department',
    badgeClass:
      'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20',
  },
  LEAD: {
    label: 'Team Lead',
    description: 'Leads a team within a department',
    badgeClass:
      'bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-600/20 dark:bg-cyan-500/10 dark:text-cyan-300 dark:ring-cyan-400/20',
  },
  ASSOCIATE: {
    label: 'Associate',
    description: 'Individual contributor',
    badgeClass:
      'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/20 dark:bg-slate-700/40 dark:text-slate-300 dark:ring-slate-400/20',
  },
};

export const ROLE_OPTIONS: { value: UserRole; label: string }[] = (
  Object.keys(ROLE_META) as UserRole[]
).map((role) => ({ value: role, label: ROLE_META[role].label }));

export const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

/** Roles that count as administrators for the summary stats. */
export const ADMIN_ROLES: UserRole[] = ['SUPERADMIN', 'ADMIN'];
