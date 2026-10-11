import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { UserRole, NavigationItem, DashboardTab, Widget } from '@/types/permissions.types';
import { AccessControl } from '@/utils/permissions';
import { getRoleConfig } from '@/config/roleConfig';

export const useAuth = () => {
  const auth = useSelector((state: RootState) => state.auth);
  
  return {
    ...auth,
    user: auth.user,
    userRole: auth.user?.role,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
  };
};

export const usePermissions = () => {
  const { user, userRole } = useAuth();
  
  if (!user || !userRole) {
    return {
      canAccess: () => false,
      canViewNavigation: () => [],
      canViewTabs: () => [],
      canViewWidgets: () => [],
      hasPermission: () => false,
      getRolePermissions: () => [],
      canAccessRoute: () => false,
      hasRoleLevel: () => false,
      getManageableRoles: () => [],
      getRoleRedirect: () => '/auth/login',
      roleConfig: null,
      userRole: null,
    };
  }

  const roleConfig = getRoleConfig(userRole);

  return {
    canAccess: (requiredRoles: UserRole[]) => AccessControl.canAccess(userRole, requiredRoles),
    canViewNavigation: (navigationItems: NavigationItem[]) => AccessControl.canViewNavigation(userRole, navigationItems),
    canViewTabs: (tabs: DashboardTab[]) => AccessControl.canViewTabs(userRole, tabs),
    canViewWidgets: (widgets: Widget[]) => AccessControl.canViewWidgets(userRole, widgets),
    hasPermission: (permissionId: string) => AccessControl.hasPermission(userRole, permissionId),
    getRolePermissions: () => AccessControl.getRolePermissions(userRole),
    canAccessRoute: (routePath: string) => AccessControl.canAccessRoute(userRole, routePath),
    hasRoleLevel: (requiredRole: UserRole) => AccessControl.hasRoleLevel(userRole, requiredRole),
    getManageableRoles: () => AccessControl.getManageableRoles(userRole),
    getRoleRedirect: () => AccessControl.getRoleRedirect(userRole),
    roleConfig,
    userRole,
  };
};

export const useRoleConfig = () => {
  const { userRole } = useAuth();
  
  if (!userRole) return null;
  
  return getRoleConfig(userRole);
};

export const useNavigation = () => {
  const { canViewNavigation, roleConfig } = usePermissions();
  
  if (!roleConfig) return [];
  
  return canViewNavigation(roleConfig.navigationItems);
};

export const useDashboardTabs = () => {
  const { canViewTabs, roleConfig } = usePermissions();
  
  if (!roleConfig) return [];
  
  return canViewTabs(roleConfig.dashboardTabs);
};

export const useDashboardWidgets = () => {
  const { canViewWidgets, roleConfig } = usePermissions();
  
  if (!roleConfig) return [];
  
  return canViewWidgets(roleConfig.widgets);
};

// Higher-order component for role-based access control
export const withRoleAccess = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles: UserRole[]
) => {
  return function RoleBasedComponent(props: P) {
    const { canAccess, userRole } = usePermissions();
    
    if (!canAccess(requiredRoles)) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">Access Denied</h3>
            <p className="text-gray-600 mt-2">
              You don't have permission to access this resource.
            </p>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
};

// Hook for checking specific permissions
export const usePermission = (permissionId: string) => {
  const { hasPermission } = usePermissions();
  
  return hasPermission(permissionId);
};

// Hook for checking multiple permissions
export const usePermissionsCheck = (permissionIds: string[]) => {
  const { hasPermission } = usePermissions();
  
  return {
    all: permissionIds.every(id => hasPermission(id)),
    any: permissionIds.some(id => hasPermission(id)),
    permissions: permissionIds.map(id => ({
      id,
      has: hasPermission(id),
    })),
  };
};
