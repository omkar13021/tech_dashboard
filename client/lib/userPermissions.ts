import { UserRole } from '@/types/auth.types';

/**
 * Frontend mirror of the backend user-permission policy
 * (backend/src/auth/permissions/user-permission.policy.ts).
 *
 * This is the SINGLE source of truth for User Management UI gating — components
 * must consult `can()` / `canManageTargetRole()` rather than checking role
 * strings inline. The backend remains the real authority; this only drives what
 * the UI shows.
 */

export type UserPermission =
  | 'VIEW'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'ACTIVATE'
  | 'DEACTIVATE'
  | 'RESET_PASSWORD'
  | 'ASSIGN_ROLE'
  | 'ASSIGN_DEPARTMENT'
  | 'ASSIGN_MANAGER';

const ALL: UserPermission[] = [
  'VIEW',
  'CREATE',
  'UPDATE',
  'DELETE',
  'ACTIVATE',
  'DEACTIVATE',
  'RESET_PASSWORD',
  'ASSIGN_ROLE',
  'ASSIGN_DEPARTMENT',
  'ASSIGN_MANAGER',
];

const ROLE_PERMISSIONS: Record<UserRole, UserPermission[]> = {
  SUPERADMIN: ALL,
  ADMIN: [
    'VIEW',
    'CREATE',
    'UPDATE',
    'ACTIVATE',
    'DEACTIVATE',
    'RESET_PASSWORD',
    'ASSIGN_DEPARTMENT',
    'ASSIGN_MANAGER',
  ],
  HOD: ['VIEW'],
  LEAD: ['VIEW'],
  ASSOCIATE: [],
};

/** Role hierarchy — who each role may act upon (mirrors backend MANAGEABLE_ROLES). */
const MANAGEABLE_ROLES: Record<UserRole, UserRole[]> = {
  SUPERADMIN: ['SUPERADMIN', 'ADMIN', 'HOD', 'LEAD', 'ASSOCIATE'],
  ADMIN: ['ADMIN', 'HOD', 'LEAD', 'ASSOCIATE'],
  HOD: ['HOD', 'LEAD', 'ASSOCIATE'],
  LEAD: ['LEAD', 'ASSOCIATE'],
  ASSOCIATE: ['ASSOCIATE'],
};

/** Roles allowed to open the User Management routes. ASSOCIATE is blocked. */
export const USER_ROUTE_ROLES: UserRole[] = ['SUPERADMIN', 'ADMIN', 'HOD', 'LEAD'];

export function can(role: UserRole | undefined, permission: UserPermission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canManageTargetRole(
  actorRole: UserRole | undefined,
  targetRole: UserRole,
): boolean {
  if (!actorRole) return false;
  return MANAGEABLE_ROLES[actorRole]?.includes(targetRole) ?? false;
}

/** True when the role can perform any mutation at all (else the UI is read-only). */
export function isReadOnly(role: UserRole | undefined): boolean {
  if (!role) return true;
  const perms = ROLE_PERMISSIONS[role] ?? [];
  return perms.length === 0 || (perms.length === 1 && perms[0] === 'VIEW');
}
