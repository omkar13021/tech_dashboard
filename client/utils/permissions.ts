import { UserRole, NavigationItem, DashboardTab, Widget } from '@/types/permissions.types';
import { getRoleConfig } from '@/config/roleConfig';

export class AccessControl {
  /**
   * Check if a user role can access based on required roles
   */
  static canAccess(userRole: UserRole, requiredRoles: UserRole[]): boolean {
    return requiredRoles.includes(userRole);
  }

  /**
   * Filter navigation items based on user role
   */
  static canViewNavigation(userRole: UserRole, navigationItems: NavigationItem[]): NavigationItem[] {
    return navigationItems
      .filter(item => this.canAccess(userRole, item.roles))
      .map(item => ({
        ...item,
        children: item.children ? this.canViewNavigation(userRole, item.children) : undefined
      }));
  }

  /**
   * Filter dashboard tabs based on user role
   */
  static canViewTabs(userRole: UserRole, tabs: DashboardTab[]): DashboardTab[] {
    return tabs.filter(tab => this.canAccess(userRole, tab.roles));
  }

  /**
   * Filter widgets based on user role
   */
  static canViewWidgets(userRole: UserRole, widgets: Widget[]): Widget[] {
    return widgets.filter(widget => this.canAccess(userRole, widget.roles));
  }

  /**
   * Get role-specific redirect path
   */
  static getRoleRedirect(userRole: UserRole): string {
    return getRoleConfig(userRole)?.dashboardRoute || '/auth/login';
  }

  /**
   * Check if user has specific permission
   */
  static hasPermission(userRole: UserRole, permissionId: string): boolean {
    const roleConfig = getRoleConfig(userRole);
    return roleConfig?.permissions.some(permission => permission.id === permissionId) || false;
  }

  /**
   * Get all permissions for a role
   */
  static getRolePermissions(userRole: UserRole) {
    const roleConfig = getRoleConfig(userRole);
    return roleConfig?.permissions || [];
  }

  /**
   * Check if user can access a specific route
   */
  static canAccessRoute(userRole: UserRole, routePath: string): boolean {
    const roleConfig = getRoleConfig(userRole);
    if (!roleConfig) return false;

    // Check if route matches dashboard route
    if (routePath === roleConfig.dashboardRoute) return true;

    // Check if route is in navigation items
    const checkNavigationItems = (items: NavigationItem[]): boolean => {
      return items.some(item => {
        if (item.href === routePath) return true;
        if (item.children) return checkNavigationItems(item.children);
        return false;
      });
    };

    return checkNavigationItems(roleConfig.navigationItems);
  }

  /**
   * Get role hierarchy level (higher number = higher privilege)
   */
  static getRoleLevel(role: UserRole): number {
    const roleHierarchy: Record<UserRole, number> = {
      'SUPERADMIN': 5,
      'ADMIN': 4,
      'HOD': 3,
      'LEAD': 2,
      'ASSOCIATE': 1,
    };
    return roleHierarchy[role] || 0;
  }

  /**
   * Check if user role has higher or equal privilege than required role
   */
  static hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
    return this.getRoleLevel(userRole) >= this.getRoleLevel(requiredRole);
  }

  /**
   * Get accessible roles for a given role (roles that can be managed)
   */
  static getManageableRoles(userRole: UserRole): UserRole[] {
    const userLevel = this.getRoleLevel(userRole);
    const allRoles: UserRole[] = ['ASSOCIATE', 'LEAD', 'HOD', 'ADMIN', 'SUPERADMIN'];
    
    return allRoles.filter(role => this.getRoleLevel(role) < userLevel);
  }
}
