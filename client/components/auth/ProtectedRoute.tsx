'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { validateUser } from '@/store/slices/authSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { useAuth, usePermissions } from '@/hooks/usePermissions';
import { AccessControl } from '@/utils/permissions';
import { UserRole } from '@/types/auth.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, ArrowLeft, Home } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requiredPermissions?: string[];
  fallbackPath?: string;
  showUnauthorizedPage?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallbackPath = '/auth/login',
  showUnauthorizedPage = true,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const { userRole } = useAuth();
  const { canAccess, hasPermission } = usePermissions();
  const [isClient, setIsClient] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Validate user session
  useEffect(() => {
    if (!isClient) return;

    const validateSession = async () => {
      try {
        if (isAuthenticated && user) {
          await dispatch(validateUser()).unwrap();
        }
      } catch (error) {
        // Session validation failed, will be handled by auth state
      } finally {
        setIsValidating(false);
      }
    };

    if (!isLoading) {
      validateSession();
    }
  }, [isAuthenticated, isLoading, user, dispatch, isClient]);

  // Handle loading states
  if (isLoading || isValidating || !isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Validating session...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    // Store the attempted path for redirect after login
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('redirectPath', pathname);
    }
    router.push(fallbackPath);
    return null;
  }

  // Check role-based access
  if (requiredRoles.length > 0 && !canAccess(requiredRoles)) {
    if (showUnauthorizedPage) {
      return <UnauthorizedPage type="role" userRole={userRole} requiredRoles={requiredRoles} />;
    }
    router.push('/unauthorized');
    return null;
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => hasPermission(permission));
    if (!hasAllPermissions) {
      if (showUnauthorizedPage) {
        return <UnauthorizedPage type="permission" userRole={userRole} requiredPermissions={requiredPermissions} />;
      }
      router.push('/unauthorized');
      return null;
    }
  }

  // Check route access
  if (userRole && !AccessControl.canAccessRoute(userRole, pathname)) {
    const redirectTo = AccessControl.getRoleRedirect(userRole);
    router.push(redirectTo);
    return null;
  }

  return <>{children}</>;
};

// Unauthorized page component
interface UnauthorizedPageProps {
  type: 'role' | 'permission';
  userRole?: UserRole;
  requiredRoles?: UserRole[];
  requiredPermissions?: string[];
}

const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({
  type,
  userRole,
  requiredRoles,
  requiredPermissions,
}) => {
  const router = useRouter();

  const getRedirectPath = () => {
    if (userRole) {
      return AccessControl.getRoleRedirect(userRole);
    }
    return '/auth/login';
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push(getRedirectPath());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500" />
          </div>
          <CardTitle className="text-xl">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-gray-600 dark:text-gray-400">
              {type === 'role' 
                ? "You don't have the required role to access this page."
                : "You don't have the required permissions to access this page."
              }
            </p>
            
            {userRole && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Your role: <span className="font-medium">{userRole}</span></p>
                {type === 'role' && requiredRoles && requiredRoles.length > 0 && (
                  <p>Required roles: <span className="font-medium">{requiredRoles.join(', ')}</span></p>
                )}
                {type === 'permission' && requiredPermissions && requiredPermissions.length > 0 && (
                  <p>Required permissions: <span className="font-medium">{requiredPermissions.join(', ')}</span></p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <Button onClick={handleGoHome} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={handleGoBack} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              If you believe this is an error, please contact your system administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Higher-order component for protecting routes
export const withProtection = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) => {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

// Specific protection HOCs
export const withSuperAdminProtection = <P extends object>(Component: React.ComponentType<P>) =>
  withProtection(Component, { requiredRoles: ['SUPERADMIN'] });

export const withAdminProtection = <P extends object>(Component: React.ComponentType<P>) =>
  withProtection(Component, { requiredRoles: ['ADMIN', 'SUPERADMIN'] });

export const withHodProtection = <P extends object>(Component: React.ComponentType<P>) =>
  withProtection(Component, { requiredRoles: ['HOD', 'ADMIN', 'SUPERADMIN'] });

export const withLeadProtection = <P extends object>(Component: React.ComponentType<P>) =>
  withProtection(Component, { requiredRoles: ['LEAD', 'HOD', 'ADMIN', 'SUPERADMIN'] });

export const withAssociateProtection = <P extends object>(Component: React.ComponentType<P>) =>
  withProtection(Component, { requiredRoles: ['ASSOCIATE', 'LEAD', 'HOD', 'ADMIN', 'SUPERADMIN'] });

export default ProtectedRoute;
