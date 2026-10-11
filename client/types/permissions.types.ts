import { UserRole } from './auth.types';

export type { UserRole };

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
  children?: NavigationItem[];
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  isExternal?: boolean;
}

export interface DashboardTab {
  id: string;
  label: string;
  value: string;
  roles: UserRole[];
  component: string;
}

export interface Widget {
  id: string;
  title: string;
  type: 'stat' | 'chart' | 'table' | 'list' | 'card';
  roles: UserRole[];
  size: {
    width: number;
    height: number;
  };
  position?: {
    x: number;
    y: number;
  };
}

export interface RoleConfig {
  role: UserRole;
  label: string;
  description: string;
  dashboardRoute: string;
  permissions: Permission[];
  navigationItems: NavigationItem[];
  dashboardTabs: DashboardTab[];
  widgets: Widget[];
}

export interface RoutePermission {
  path: string;
  roles: UserRole[];
  redirectPath?: string;
}

export interface AccessControl {
  canAccess: (role: UserRole, requiredRoles: UserRole[]) => boolean;
  canViewNavigation: (role: UserRole, navigationItems: NavigationItem[]) => NavigationItem[];
  canViewTabs: (role: UserRole, tabs: DashboardTab[]) => DashboardTab[];
  canViewWidgets: (role: UserRole, widgets: Widget[]) => Widget[];
  getRoleRedirect: (role: UserRole) => string;
}
