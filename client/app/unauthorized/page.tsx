'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft, Home, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/usePermissions';
import { AccessControl } from '@/utils/permissions';
import { Logo } from '@/components/common';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, userRole } = useAuth();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    if (userRole) {
      const dashboardPath = AccessControl.getRoleRedirect(userRole);
      router.push(dashboardPath);
    } else {
      router.push('/auth/login');
    }
  };

  const handleLogout = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Logo variant="default" className="h-8 mx-auto mb-6" priority />
          <div className="mx-auto mb-4">
            <Shield className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-xl">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to access this page.
            </p>
            
            {user && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Logged in as: <span className="font-medium">{user.firstName} {user.lastName}</span></p>
                <p>Role: <span className="font-medium">{userRole}</span></p>
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
            {user && (
              <Button variant="ghost" onClick={handleLogout} className="w-full">
                Logout
              </Button>
            )}
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
}
