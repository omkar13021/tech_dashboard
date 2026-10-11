'use client';

import { useMemo } from 'react';
import { useAuth } from '@/hooks/usePermissions';
import { useAuthz } from '@/hooks/useAuthz';
import { ManagedUser } from '@/types/user.types';
import { canManageTargetRole } from '@/lib/userPermissions';

/**
 * User Management UI gating, now driven by EFFECTIVE permissions from the
 * backend (user.*). The role hierarchy (canManageTargetRole) is retained as a
 * UI-only refinement so e.g. an admin doesn't see actions on a SUPERADMIN.
 * The backend remains the source of truth.
 */
export function useUserPermissions() {
  const { userRole } = useAuth();
  const { has } = useAuthz();

  return useMemo(() => {
    const manage = (target: ManagedUser) => canManageTargetRole(userRole, target.role);
    const canEditPerm = has('user.edit');
    const canDeletePerm = has('user.delete');

    return {
      role: userRole,
      readOnly: !has('user.create') && !canEditPerm && !canDeletePerm,
      canCreate: has('user.create'),
      canAssignRole: has('user.assign'),
      canAssignDepartment: has('user.assign'),
      canAssignManager: has('user.assign'),
      canEdit: (u: ManagedUser) => canEditPerm && manage(u),
      canDelete: (u: ManagedUser) => canDeletePerm && manage(u),
      canToggleStatus: (u: ManagedUser) => canEditPerm && manage(u),
      canResetPassword: (u: ManagedUser) => canEditPerm && manage(u),
      hasRowActions: (u: ManagedUser) =>
        (canEditPerm || canDeletePerm) && manage(u),
    };
  }, [userRole, has]);
}

export type UserPermissionState = ReturnType<typeof useUserPermissions>;
