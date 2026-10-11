'use client';

import React from 'react';
import { useAuthz } from '@/hooks/useAuthz';
import { AccessDenied } from './AccessDenied';

interface PermissionRouteProps {
  permission?: string;
  anyOf?: string[];
  allOf?: string[];
  children: React.ReactNode;
}

/**
 * Route-level protection. Shows a loading state while auth resolves, a 403
 * surface when the permission requirement isn't met, otherwise the page.
 * Supports single / allOf / anyOf requirements.
 */
export function PermissionRoute({
  permission,
  anyOf,
  allOf,
  children,
}: PermissionRouteProps) {
  const { has, hasAny, hasAll, isLoading } = useAuthz();

  // AuthProvider blocks rendering until auth resolves; this just covers in-flight refreshes.
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  let ok = true;
  if (permission) ok = ok && has(permission);
  if (anyOf?.length) ok = ok && hasAny(anyOf);
  if (allOf?.length) ok = ok && hasAll(allOf);

  if (!ok) return <AccessDenied />;
  return <>{children}</>;
}
