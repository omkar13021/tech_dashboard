'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/hooks/useAppSelector';
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from '@/lib/permissions';

/**
 * Central authorization hook for the UI. Reads the effective permission set from
 * the auth store and exposes ergonomic checks. Use this (or <PermissionGate>)
 * everywhere instead of inspecting roles directly.
 */
export function useAuthz() {
  const permissions = useAppSelector((s) => s.auth.permissions);
  const isLoading = useAppSelector((s) => s.auth.isLoading);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  return useMemo(
    () => ({
      permissions,
      isLoading,
      isAuthenticated,
      has: (key: string) => hasPermission(permissions, key),
      hasAny: (keys: string[]) => hasAnyPermission(permissions, keys),
      hasAll: (keys: string[]) => hasAllPermissions(permissions, keys),
    }),
    [permissions, isLoading, isAuthenticated],
  );
}

export type Authz = ReturnType<typeof useAuthz>;
