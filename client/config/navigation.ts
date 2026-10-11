import { UserRole } from '@/types/auth.types';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
  /** Optional permission gate (used by permission-driven sections). */
  permission?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
}

export interface NavSection {
  id: string;
  label?: string;
  items: NavItem[];
  roles: UserRole[];
}

const ALL_ROLES: UserRole[] = ['SUPERADMIN', 'ADMIN', 'HOD', 'LEAD', 'ASSOCIATE'];

// Personal workspace — available to every authenticated user (not permission-gated).
const commonTaskNav: NavItem[] = [
  { id: 'my-day', label: 'My Day', href: '/my-day', icon: 'Sun', roles: ALL_ROLES },
  { id: 'important', label: 'Important', href: '/important', icon: 'Star', roles: ALL_ROLES },
  { id: 'planned', label: 'Planned', href: '/planned', icon: 'Calendar', roles: ALL_ROLES },
  { id: 'assigned', label: 'Assigned to Me', href: '/assigned', icon: 'UserCheck', roles: ALL_ROLES },
  { id: 'meetings', label: 'Meetings', href: '/meetings', icon: 'Video', roles: ALL_ROLES },
  { id: 'tasks', label: 'Tasks', href: '/tasks', icon: 'CheckSquare', roles: ALL_ROLES },
];

const dashboardItem = (role: UserRole): NavItem => ({
  id: 'dashboard',
  label: 'Dashboard',
  href: '/dashboard',
  icon: 'LayoutDashboard',
  roles: [role],
});

/*
 * Role-specific items that do NOT yet have a permission module (placeholder
 * areas). These remain role-gated until their modules are added to the
 * permission registry. Everything that HAS a permission lives in the
 * permission-driven sections (see config/permissionNavigation.ts).
 */
const superAdminExtra: NavItem[] = [
  { id: 'companies', label: 'Companies', href: '/companies', icon: 'Building2', roles: ['SUPERADMIN'] },
  { id: 'departments', label: 'Departments', href: '/departments', icon: 'Building', roles: ['SUPERADMIN'] },
];

const adminExtra: NavItem[] = [
  { id: 'departments', label: 'Departments', href: '/departments', icon: 'Building', roles: ['ADMIN'] },
];

const hodExtra: NavItem[] = [
  { id: 'department', label: 'Department', href: '/department', icon: 'Building', roles: ['HOD'] },
  { id: 'team', label: 'Team', href: '/team', icon: 'Users', roles: ['HOD'] },
];

const leadExtra: NavItem[] = [
  { id: 'team', label: 'Team', href: '/team', icon: 'Users', roles: ['LEAD'] },
];

function buildSections(role: UserRole, extra: NavItem[]): NavSection[] {
  const sections: NavSection[] = [
    { id: 'common', items: [dashboardItem(role)], roles: [role] },
    { id: 'tasks', label: 'Personal', items: commonTaskNav, roles: [role] },
  ];
  if (extra.length) {
    sections.push({ id: 'workspace-extra', label: 'Workspace', items: extra, roles: [role] });
  }
  return sections;
}

// Personal + role-specific placeholder navigation by role. The governed
// (permission-driven) menu is added separately by the sidebar.
export const navigationSections: Record<UserRole, NavSection[]> = {
  SUPERADMIN: buildSections('SUPERADMIN', superAdminExtra),
  ADMIN: buildSections('ADMIN', adminExtra),
  HOD: buildSections('HOD', hodExtra),
  LEAD: buildSections('LEAD', leadExtra),
  ASSOCIATE: buildSections('ASSOCIATE', []),
};

export function getNavigationForRole(role: UserRole): NavSection[] {
  return navigationSections[role] || [];
}

export function getAllNavItems(role: UserRole): NavItem[] {
  return getNavigationForRole(role).flatMap((section) => section.items);
}

export function findNavItem(id: string, role: UserRole): NavItem | undefined {
  return getAllNavItems(role).find((item) => item.id === id);
}
