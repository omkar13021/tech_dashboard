import { UserRole, RoleConfig, Permission } from '@/types/permissions.types';

// Base permissions that can be reused across roles
const basePermissions: Permission[] = [
  { id: 'dashboard.view', name: 'View Dashboard', description: 'Access to dashboard overview' },
  { id: 'profile.view', name: 'View Profile', description: 'View own profile information' },
  { id: 'profile.edit', name: 'Edit Profile', description: 'Edit own profile information' },
  { id: 'notifications.view', name: 'View Notifications', description: 'View system notifications' },
];

const superAdminPermissions: Permission[] = [
  ...basePermissions,
  { id: 'users.view', name: 'View Users', description: 'View all users in the system' },
  { id: 'users.create', name: 'Create Users', description: 'Create new users' },
  { id: 'users.edit', name: 'Edit Users', description: 'Edit existing users' },
  { id: 'users.delete', name: 'Delete Users', description: 'Delete users' },
  { id: 'departments.view', name: 'View Departments', description: 'View all departments' },
  { id: 'departments.create', name: 'Create Departments', description: 'Create new departments' },
  { id: 'departments.edit', name: 'Edit Departments', description: 'Edit existing departments' },
  { id: 'departments.delete', name: 'Delete Departments', description: 'Delete departments' },
  { id: 'reports.view', name: 'View Reports', description: 'Access to all reports' },
  { id: 'reports.export', name: 'Export Reports', description: 'Export reports data' },
  { id: 'settings.system', name: 'System Settings', description: 'Access to system configuration' },
  { id: 'audit.view', name: 'View Audit Logs', description: 'Access to audit trail' },
];

const adminPermissions: Permission[] = [
  ...basePermissions,
  { id: 'users.view', name: 'View Users', description: 'View users in organization' },
  { id: 'users.create', name: 'Create Users', description: 'Create new users' },
  { id: 'users.edit', name: 'Edit Users', description: 'Edit existing users' },
  { id: 'departments.view', name: 'View Departments', description: 'View departments' },
  { id: 'departments.edit', name: 'Edit Departments', description: 'Edit existing departments' },
  { id: 'projects.view', name: 'View Projects', description: 'View all projects' },
  { id: 'projects.create', name: 'Create Projects', description: 'Create new projects' },
  { id: 'projects.edit', name: 'Edit Projects', description: 'Edit existing projects' },
  { id: 'reports.view', name: 'View Reports', description: 'Access to organization reports' },
  { id: 'reports.export', name: 'Export Reports', description: 'Export reports data' },
];

const hodPermissions: Permission[] = [
  ...basePermissions,
  { id: 'users.view', name: 'View Department Users', description: 'View users in department' },
  { id: 'users.edit', name: 'Edit Department Users', description: 'Edit users in department' },
  { id: 'projects.view', name: 'View Projects', description: 'View department projects' },
  { id: 'projects.create', name: 'Create Projects', description: 'Create new projects' },
  { id: 'projects.edit', name: 'Edit Projects', description: 'Edit existing projects' },
  { id: 'tasks.view', name: 'View Tasks', description: 'View all department tasks' },
  { id: 'tasks.assign', name: 'Assign Tasks', description: 'Assign tasks to team members' },
  { id: 'reports.department', name: 'Department Reports', description: 'Access to department reports' },
];

const leadPermissions: Permission[] = [
  ...basePermissions,
  { id: 'projects.view', name: 'View Team Projects', description: 'View team projects' },
  { id: 'projects.edit', name: 'Edit Projects', description: 'Edit project details' },
  { id: 'tasks.view', name: 'View Tasks', description: 'View team tasks' },
  { id: 'tasks.create', name: 'Create Tasks', description: 'Create new tasks' },
  { id: 'tasks.assign', name: 'Assign Tasks', description: 'Assign tasks to team members' },
  { id: 'tasks.edit', name: 'Edit Tasks', description: 'Edit existing tasks' },
  { id: 'reports.team', name: 'Team Reports', description: 'Access to team reports' },
];

const associatePermissions: Permission[] = [
  ...basePermissions,
  { id: 'projects.view', name: 'View Assigned Projects', description: 'View assigned projects' },
  { id: 'tasks.view', name: 'View Tasks', description: 'View assigned tasks' },
  { id: 'tasks.edit', name: 'Update Task Status', description: 'Update task status and progress' },
  { id: 'reports.personal', name: 'Personal Reports', description: 'Access to personal reports' },
];

export const roleConfigs: Record<UserRole, RoleConfig> = {
  SUPERADMIN: {
    role: 'SUPERADMIN',
    label: 'Super Admin',
    description: 'Full system access with all permissions',
    dashboardRoute: '/my-day',
    permissions: superAdminPermissions,
    navigationItems: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/superadmin',
        icon: 'LayoutDashboard',
        roles: ['SUPERADMIN'],
      },
      {
        id: 'tasks',
        label: 'Tasks',
        href: '/tasks/my-day',
        icon: 'ListTodo',
        roles: ['SUPERADMIN'],
      },
      {
        id: 'users',
        label: 'Users',
        href: '/superadmin/users',
        icon: 'Users',
        roles: ['SUPERADMIN'],
        badge: { text: 'New', variant: 'secondary' },
      },
      {
        id: 'departments',
        label: 'Departments',
        href: '/superadmin/departments',
        icon: 'Building2',
        roles: ['SUPERADMIN'],
      },
      {
        id: 'projects',
        label: 'Projects',
        href: '/superadmin/projects',
        icon: 'FolderKanban',
        roles: ['SUPERADMIN'],
      },
      {
        id: 'reports',
        label: 'Reports',
        href: '/superadmin/reports',
        icon: 'ChartBar',
        roles: ['SUPERADMIN'],
        children: [
          {
            id: 'reports-overview',
            label: 'Overview',
            href: '/superadmin/reports/overview',
            icon: 'BarChart3',
            roles: ['SUPERADMIN'],
          },
          {
            id: 'reports-analytics',
            label: 'Analytics',
            href: '/superadmin/reports/analytics',
            icon: 'TrendingUp',
            roles: ['SUPERADMIN'],
          },
          {
            id: 'reports-exports',
            label: 'Exports',
            href: '/superadmin/reports/exports',
            icon: 'Download',
            roles: ['SUPERADMIN'],
          },
        ],
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '/superadmin/settings',
        icon: 'Settings',
        roles: ['SUPERADMIN'],
        children: [
          {
            id: 'settings-system',
            label: 'System',
            href: '/superadmin/settings/system',
            icon: 'Server',
            roles: ['SUPERADMIN'],
          },
          {
            id: 'settings-security',
            label: 'Security',
            href: '/superadmin/settings/security',
            icon: 'Shield',
            roles: ['SUPERADMIN'],
          },
          {
            id: 'settings-audit',
            label: 'Audit Logs',
            href: '/superadmin/settings/audit',
            icon: 'FileText',
            roles: ['SUPERADMIN'],
          },
        ],
      },
    ],
    dashboardTabs: [
      { id: 'overview', label: 'Overview', value: 'overview', roles: ['SUPERADMIN'], component: 'OverviewTab' },
      { id: 'analytics', label: 'Analytics', value: 'analytics', roles: ['SUPERADMIN'], component: 'AnalyticsTab' },
      { id: 'users', label: 'Users', value: 'users', roles: ['SUPERADMIN'], component: 'UsersTab' },
      { id: 'system', label: 'System', value: 'system', roles: ['SUPERADMIN'], component: 'SystemTab' },
    ],
    widgets: [
      {
        id: 'total-users',
        title: 'Total Users',
        type: 'stat',
        roles: ['SUPERADMIN'],
        size: { width: 1, height: 1 },
      },
      {
        id: 'active-projects',
        title: 'Active Projects',
        type: 'stat',
        roles: ['SUPERADMIN'],
        size: { width: 1, height: 1 },
      },
      {
        id: 'system-health',
        title: 'System Health',
        type: 'chart',
        roles: ['SUPERADMIN'],
        size: { width: 2, height: 2 },
      },
      {
        id: 'recent-activity',
        title: 'Recent Activity',
        type: 'list',
        roles: ['SUPERADMIN'],
        size: { width: 2, height: 2 },
      },
    ],
  },
  ADMIN: {
    role: 'ADMIN',
    label: 'Admin',
    description: 'Organization-level administration',
    dashboardRoute: '/my-day',
    permissions: adminPermissions,
    navigationItems: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/admin',
        icon: 'LayoutDashboard',
        roles: ['ADMIN'],
      },
      {
        id: 'tasks',
        label: 'Tasks',
        href: '/tasks/my-day',
        icon: 'ListTodo',
        roles: ['ADMIN'],
      },
      {
        id: 'users',
        label: 'Users',
        href: '/admin/users',
        icon: 'Users',
        roles: ['ADMIN'],
      },
      {
        id: 'departments',
        label: 'Departments',
        href: '/admin/departments',
        icon: 'Building2',
        roles: ['ADMIN'],
      },
      {
        id: 'projects',
        label: 'Projects',
        href: '/admin/projects',
        icon: 'FolderKanban',
        roles: ['ADMIN'],
      },
      {
        id: 'reports',
        label: 'Reports',
        href: '/admin/reports',
        icon: 'ChartBar',
        roles: ['ADMIN'],
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '/admin/settings',
        icon: 'Settings',
        roles: ['ADMIN'],
      },
    ],
    dashboardTabs: [
      { id: 'overview', label: 'Overview', value: 'overview', roles: ['ADMIN'], component: 'OverviewTab' },
      { id: 'users', label: 'Users', value: 'users', roles: ['ADMIN'], component: 'UsersTab' },
      { id: 'projects', label: 'Projects', value: 'projects', roles: ['ADMIN'], component: 'ProjectsTab' },
    ],
    widgets: [
      {
        id: 'org-users',
        title: 'Organization Users',
        type: 'stat',
        roles: ['ADMIN'],
        size: { width: 1, height: 1 },
      },
      {
        id: 'active-departments',
        title: 'Active Departments',
        type: 'stat',
        roles: ['ADMIN'],
        size: { width: 1, height: 1 },
      },
      {
        id: 'project-status',
        title: 'Project Status',
        type: 'chart',
        roles: ['ADMIN'],
        size: { width: 2, height: 2 },
      },
    ],
  },
  HOD: {
    role: 'HOD',
    label: 'Head of Department',
    description: 'Department-level management',
    dashboardRoute: '/my-day',
    permissions: hodPermissions,
    navigationItems: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/hod',
        icon: 'LayoutDashboard',
        roles: ['HOD'],
      },
      {
        id: 'team',
        label: 'Team',
        href: '/hod/team',
        icon: 'Users',
        roles: ['HOD'],
      },
      {
        id: 'projects',
        label: 'Projects',
        href: '/hod/projects',
        icon: 'FolderKanban',
        roles: ['HOD'],
      },
      {
        id: 'tasks',
        label: 'Tasks',
        href: '/tasks/my-day',
        icon: 'ListTodo',
        roles: ['HOD'],
      },
      {
        id: 'reports',
        label: 'Reports',
        href: '/hod/reports',
        icon: 'ChartBar',
        roles: ['HOD'],
      },
    ],
    dashboardTabs: [
      { id: 'overview', label: 'Overview', value: 'overview', roles: ['HOD'], component: 'OverviewTab' },
      { id: 'team', label: 'Team', value: 'team', roles: ['HOD'], component: 'TeamTab' },
      { id: 'projects', label: 'Projects', value: 'projects', roles: ['HOD'], component: 'ProjectsTab' },
    ],
    widgets: [
      {
        id: 'team-size',
        title: 'Team Size',
        type: 'stat',
        roles: ['HOD'],
        size: { width: 1, height: 1 },
      },
      {
        id: 'active-projects',
        title: 'Active Projects',
        type: 'stat',
        roles: ['HOD'],
        size: { width: 1, height: 1 },
      },
      {
        id: 'task-distribution',
        title: 'Task Distribution',
        type: 'chart',
        roles: ['HOD'],
        size: { width: 2, height: 2 },
      },
    ],
  },
  LEAD: {
    role: 'LEAD',
    label: 'Team Lead',
    description: 'Team-level management and coordination',
    dashboardRoute: '/my-day',
    permissions: leadPermissions,
    navigationItems: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/lead',
        icon: 'LayoutDashboard',
        roles: ['LEAD'],
      },
      {
        id: 'projects',
        label: 'Projects',
        href: '/lead/projects',
        icon: 'FolderKanban',
        roles: ['LEAD'],
      },
      {
        id: 'tasks',
        label: 'Tasks',
        href: '/tasks/my-day',
        icon: 'ListTodo',
        roles: ['LEAD'],
      },
      {
        id: 'team',
        label: 'Team',
        href: '/lead/team',
        icon: 'Users',
        roles: ['LEAD'],
      },
      {
        id: 'reports',
        label: 'Reports',
        href: '/lead/reports',
        icon: 'ChartBar',
        roles: ['LEAD'],
      },
    ],
    dashboardTabs: [
      { id: 'overview', label: 'Overview', value: 'overview', roles: ['LEAD'], component: 'OverviewTab' },
      { id: 'tasks', label: 'Tasks', value: 'tasks', roles: ['LEAD'], component: 'TasksTab' },
      { id: 'projects', label: 'Projects', value: 'projects', roles: ['LEAD'], component: 'ProjectsTab' },
    ],
    widgets: [
      {
        id: 'team-members',
        title: 'Team Members',
        type: 'stat',
        roles: ['LEAD'],
        size: { width: 1, height: 1 },
      },
      {
        id: 'pending-tasks',
        title: 'Pending Tasks',
        type: 'stat',
        roles: ['LEAD'],
        size: { width: 1, height: 1 },
      },
      {
        id: 'project-progress',
        title: 'Project Progress',
        type: 'chart',
        roles: ['LEAD'],
        size: { width: 2, height: 2 },
      },
    ],
  },
  ASSOCIATE: {
    role: 'ASSOCIATE',
    label: 'Associate',
    description: 'Individual contributor access',
    dashboardRoute: '/my-day',
    permissions: associatePermissions,
    navigationItems: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/associate',
        icon: 'LayoutDashboard',
        roles: ['ASSOCIATE'],
      },
      {
        id: 'projects',
        label: 'My Projects',
        href: '/associate/projects',
        icon: 'FolderKanban',
        roles: ['ASSOCIATE'],
      },
      {
        id: 'tasks',
        label: 'My Tasks',
        href: '/tasks/my-day',
        icon: 'ListTodo',
        roles: ['ASSOCIATE'],
      },
      {
        id: 'reports',
        label: 'My Reports',
        href: '/associate/reports',
        icon: 'ChartBar',
        roles: ['ASSOCIATE'],
      },
    ],
    dashboardTabs: [
      { id: 'overview', label: 'Overview', value: 'overview', roles: ['ASSOCIATE'], component: 'OverviewTab' },
      { id: 'tasks', label: 'My Tasks', value: 'tasks', roles: ['ASSOCIATE'], component: 'TasksTab' },
      { id: 'projects', label: 'My Projects', value: 'projects', roles: ['ASSOCIATE'], component: 'ProjectsTab' },
    ],
    widgets: [
      {
        id: 'assigned-tasks',
        title: 'Assigned Tasks',
        type: 'stat',
        roles: ['ASSOCIATE'],
        size: { width: 1, height: 1 },
      },
      {
        id: 'completed-tasks',
        title: 'Completed Tasks',
        type: 'stat',
        roles: ['ASSOCIATE'],
        size: { width: 1, height: 1 },
      },
      {
        id: 'task-progress',
        title: 'Task Progress',
        type: 'chart',
        roles: ['ASSOCIATE'],
        size: { width: 2, height: 2 },
      },
    ],
  },
};

export const getRoleConfig = (role: UserRole): RoleConfig => {
  return roleConfigs[role];
};

export const getRoleRedirect = (role: UserRole): string => {
  return roleConfigs[role]?.dashboardRoute || '/auth/login';
};
