'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission: string;
  fallbackPath?: string;
}

export function PermissionGuard({
  children,
  requiredPermission,
  fallbackPath = '/dashboard',
}: PermissionGuardProps) {
  const router = useRouter();
  const { isLoading } = useAuth();
  const { hasPermission } = usePermissions();

  useEffect(() => {
    if (!isLoading) {
      if (!hasPermission(requiredPermission)) {
        router.push(fallbackPath);
      }
    }
  }, [hasPermission, isLoading, requiredPermission, fallbackPath, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasPermission(requiredPermission)) {
    return null;
  }

  return <>{children}</>;
}
