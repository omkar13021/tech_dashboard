/**
 * Permission-driven navigation. These sections are role-AGNOSTIC: an item shows
 * purely when the user holds the required effective permission. So granting
 * `project.view` to any custom role surfaces Projects for that user, and the
 * menu updates the moment permissions change. No hardcoded role visibility.
 */
export interface PermissionNavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  permission?: string;
  anyPermissions?: string[];
}

export interface PermissionNavSection {
  id: string;
  label: string;
  items: PermissionNavItem[];
}

export const permissionNavSections: PermissionNavSection[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { id: 'projects', label: 'Projects', href: '/projects', icon: 'FolderKanban', permission: 'project.view' },
      { id: 'performance', label: 'Team Performance', href: '/performance', icon: 'Gauge', permission: 'performance.view' },
      { id: 'reports', label: 'Reports', href: '/reports', icon: 'FileText', permission: 'report.view' },
      { id: 'analytics', label: 'Analytics', href: '/analytics', icon: 'BarChart3', permission: 'report.view' },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    items: [
      { id: 'users', label: 'Users', href: '/users', icon: 'Users', permission: 'user.view' },
      { id: 'roles', label: 'Roles & Permissions', href: '/roles', icon: 'Shield', permission: 'role.view' },
      { id: 'assistants', label: 'Assistants', href: '/assistants', icon: 'UserCog', permission: 'assistant.view' },
      { id: 'audit', label: 'Audit Logs', href: '/audit', icon: 'FileClock', permission: 'audit.view' },
      { id: 'settings', label: 'Settings', href: '/system-settings', icon: 'Settings', permission: 'settings.view' },
    ],
  },
];
