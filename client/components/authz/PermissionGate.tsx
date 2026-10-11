'use client';

import React from 'react';
import { useAuthz } from '@/hooks/useAuthz';

interface PermissionGateProps {
  /** Single permission that must be held. */
  permission?: string;
  /** At least one of these must be held. */
  anyOf?: string[];
  /** All of these must be held. */
  allOf?: string[];
  /** Rendered when the check fails (defaults to nothing). */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Conditionally renders children based on the current user's effective
 * permissions. Reusable for action/section visibility:
 *
 *   <PermissionGate permission="user.create"><CreateButton/></PermissionGate>
 *   <PermissionGate anyOf={["report.view","report.export"]}>...</PermissionGate>
 */
export function PermissionGate({
  permission,
  anyOf,
  allOf,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { has, hasAny, hasAll } = useAuthz();

  let ok = true;
  if (permission) ok = ok && has(permission);
  if (anyOf?.length) ok = ok && hasAny(anyOf);
  if (allOf?.length) ok = ok && hasAll(allOf);

  return <>{ok ? children : fallback}</>;
}
