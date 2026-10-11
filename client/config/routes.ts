import { UserRole } from '@/types/auth.types';

export interface RouteConfig {
  path: string;
  title: string;
  description?: string;
  roles: UserRole[];
  parent?: string;
}

export const routes: Record<string, RouteConfig> = {
  // Common Routes
  home: {
    path: '/',
    title: 'Home',
    roles: ['SUPERADMIN', 'ADMIN', 'HOD', 'LEAD', 'ASSOCIATE'],
  },
  dashboard: {
    path: '/dashboard',
    title: 'Dashboard',
    description: 'Overview of your tasks and activities',
    roles: ['SUPERADMIN', 'ADMIN', 'HOD', 'LEAD', 'ASSOCIATE'],
  },

  // Task Management Routes
  myDay: {
    path: '/my-day',
    title: 'My Day',
    description: 'Tasks planned for today',
    roles: ['SUPERADMIN', 'ADMIN', 'HOD', 'LEAD', 'ASSOCIATE'],
  },
  important: {
    path: '/important',
    title: 'Important',
    description: 'High priority tasks',
    roles: ['SUPERADMIN', 'ADMIN', 'HOD', 'LEAD', 'ASSOCIATE'],
  },
  planned: {
    path: '/planned',
    title: 'Planned',
    description: 'Scheduled tasks',
    roles: ['SUPERADMIN', 'ADMIN', 'HOD', 'LEAD', 'ASSOCIATE'],
  },
  assigned: {
    path: '/assigned',
    title: 'Assigned to Me',
    description: 'Tasks assigned to you',
    roles: ['SUPERADMIN', 'ADMIN', 'HOD', 'LEAD', 'ASSOCIATE'],
  },
  meetings: {
    path: '/meetings',
    title: 'Meetings',
    description: 'Scheduled meetings',
    roles: ['SUPERADMIN', 'ADMIN', 'HOD', 'LEAD', 'ASSOCIATE'],
  },
  tasks: {
    path: '/tasks',
    title: 'Tasks',
    description: 'All tasks',
    roles: ['SUPERADMIN', 'ADMIN', 'HOD', 'LEAD', 'ASSOCIATE'],
  },

  // Projects
  projects: {
    path: '/projects',
    title: 'Projects',
    description: 'Manage projects',
    roles: ['SUPERADMIN', 'ADMIN', 'HOD', 'LEAD'],
  },
  projectDetail: {
    path: '/projects/[id]',
    title: 'Project Details',
    roles: ['SUPERADMIN', 'ADMIN', 'HOD', 'LEAD'],
    parent: '/projects',
  },
  myProjects: {
    path: '/my-projects',
    title: 'My Projects',
    description: 'Projects assigned to you',
    roles: ['ASSOCIATE'],
  },

  // Team
  team: {
    path: '/team',
    title: 'Team',
    description: 'Manage team members',
    roles: ['HOD', 'LEAD'],
  },
  teamMember: {
    path: '/team/[id]',
    title: 'Team Member',
    roles: ['HOD', 'LEAD'],
    parent: '/team',
  },

  // Users
  users: {
    path: '/users',
    title: 'Users',
    description: 'Manage users',
    roles: ['SUPERADMIN', 'ADMIN'],
  },
  userDetail: {
    path: '/users/[id]',
    title: 'User Details',
    roles: ['SUPERADMIN', 'ADMIN'],
    parent: '/users',
  },

  // Departments
  departments: {
    path: '/departments',
    title: 'Departments',
    description: 'Manage departments',
    roles: ['SUPERADMIN', 'ADMIN'],
  },
  departmentDetail: {
    path: '/departments/[id]',
    title: 'Department Details',
    roles: ['SUPERADMIN', 'ADMIN'],
    parent: '/departments',
  },
  department: {
    path: '/department',
    title: 'Department',
    description: 'Your department overview',
    roles: ['HOD'],
  },

  // Companies
  companies: {
    path: '/companies',
    title: 'Companies',
    description: 'Manage companies',
    roles: ['SUPERADMIN'],
  },
  companyDetail: {
    path: '/companies/[id]',
    title: 'Company Details',
    roles: ['SUPERADMIN'],
    parent: '/companies',
  },

  // Reports
  reports: {
    path: '/reports',
    title: 'Reports',
    description: 'View and generate reports',
    roles: ['SUPERADMIN', 'ADMIN', 'HOD', 'LEAD'],
  },
  myReports: {
    path: '/my-reports',
    title: 'My Reports',
    description: 'Your personal reports',
    roles: ['ASSOCIATE'],
  },

  // Analytics
  analytics: {
    path: '/analytics',
    title: 'Analytics',
    description: 'System analytics and insights',
    roles: ['SUPERADMIN', 'ADMIN'],
  },

  // Roles & Permissions
  rolesPermissions: {
    path: '/roles-permissions',
    title: 'Roles & Permissions',
    description: 'Manage roles and permissions',
    roles: ['SUPERADMIN'],
  },

  // System Settings
  systemSettings: {
    path: '/system-settings',
    title: 'System Settings',
    description: 'Configure system settings',
    roles: ['SUPERADMIN'],
  },

  // Audit Logs
  auditLogs: {
    path: '/audit-logs',
    title: 'Audit Logs',
    description: 'System audit trail',
    roles: ['SUPERADMIN'],
  },

  // Integrations
  integrations: {
    path: '/integrations',
    title: 'Integrations',
    description: 'Third-party integrations',
    roles: ['SUPERADMIN'],
  },
};

export function getRouteByPath(path: string): RouteConfig | undefined {
  return Object.values(routes).find((route) => route.path === path);
}

export function hasRouteAccess(path: string, userRole: UserRole): boolean {
  const route = getRouteByPath(path);
  if (!route) return false;
  return route.roles.includes(userRole);
}

export function getAccessibleRoutes(userRole: UserRole): RouteConfig[] {
  return Object.values(routes).filter((route) =>
    route.roles.includes(userRole)
  );
}
