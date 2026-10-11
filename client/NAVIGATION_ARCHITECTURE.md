# ERP Navigation Architecture

## Overview

This document describes the complete navigation architecture for the ERP system, including role-based access control, dynamic sidebar generation, route protection, and placeholder pages.

## Architecture Components

### 1. Configuration Files

#### `config/routes.ts`
Centralized route configuration with role-based access control.

```typescript
interface RouteConfig {
  path: string;
  title: string;
  description?: string;
  roles: UserRole[];
  parent?: string;
}
```

**Key Functions:**
- `getRouteByPath(path: string)` - Find route configuration by path
- `hasRouteAccess(path: string, userRole: UserRole)` - Check if user has access
- `getAccessibleRoutes(userRole: UserRole)` - Get all accessible routes for a role

#### `config/navigation.ts`
Dynamic navigation menu configuration for all roles.

```typescript
interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;  // Lucide icon name
  roles: UserRole[];
  badge?: { text: string; variant?: string };
}

interface NavSection {
  id: string;
  label?: string;  // Section header label
  items: NavItem[];
  roles: UserRole[];
}
```

**Key Functions:**
- `getNavigationForRole(role: UserRole)` - Get navigation sections for a role
- `getAllNavItems(role: UserRole)` - Get all nav items for a role
- `findNavItem(id: string, role: UserRole)` - Find specific nav item

### 2. Guard Components

#### `components/guards/RoleGuard.tsx`
Protects routes based on user role.

```tsx
<RoleGuard allowedRoles={['SUPERADMIN', 'ADMIN']}>
  <YourComponent />
</RoleGuard>
```

#### `components/guards/PermissionGuard.tsx`
Protects routes based on specific permissions.

```tsx
<PermissionGuard requiredPermission="users.create">
  <CreateUserForm />
</PermissionGuard>
```

### 3. Common Components

#### `components/common/PageHeader.tsx`
Standardized page header with breadcrumbs.

```tsx
<PageHeader
  title="Page Title"
  description="Page description"
  actions={<Button>Action</Button>}
  showBreadcrumbs={true}
/>
```

#### `components/common/Breadcrumbs.tsx`
Automatic breadcrumb generation from URL path.

```tsx
<Breadcrumbs />
// or with custom items
<Breadcrumbs items={[
  { label: 'Home', href: '/' },
  { label: 'Current Page' }
]} />
```

#### `components/common/ComingSoon.tsx`
Placeholder component for modules under development.

```tsx
<ComingSoon
  title="Module Name"
  description="Description of the module"
  features={[
    'Feature 1',
    'Feature 2',
  ]}
/>
```

### 4. Dynamic Sidebar

#### `components/layout/DynamicSidebar.tsx`
Role-based dynamic sidebar that generates navigation from configuration.

**Features:**
- Automatic icon loading from Lucide React
- Task count badges for task-related items
- Active state highlighting
- Responsive mobile sidebar
- Section separators
- User profile dropdown

## Role-Based Navigation

### SUPERADMIN

**Common Section:**
- Dashboard

**Personal Section:**
- My Day
- Important
- Planned
- Assigned to Me
- Meetings
- Tasks

**Management Section:**
- Companies
- Users
- Departments
- Projects
- Reports
- Analytics

**System Section:**
- Roles & Permissions
- System Settings
- Audit Logs
- Integrations

### ADMIN

**Common Section:**
- Dashboard

**Personal Section:**
- My Day
- Important
- Planned
- Assigned to Me
- Meetings
- Tasks

**Management Section:**
- Users
- Departments
- Projects
- Reports
- Analytics

### HOD (Head of Department)

**Common Section:**
- Dashboard

**Personal Section:**
- My Day
- Important
- Planned
- Assigned to Me
- Meetings
- Tasks

**Management Section:**
- Department
- Team
- Projects
- Reports

### LEAD

**Common Section:**
- Dashboard

**Personal Section:**
- My Day
- Important
- Planned
- Assigned to Me
- Meetings
- Tasks

**Management Section:**
- Team
- Projects
- Reports

### ASSOCIATE

**Common Section:**
- Dashboard

**Personal Section:**
- My Day
- Important
- Planned
- Assigned to Me
- Meetings
- Tasks

**Work Section:**
- My Projects
- My Reports

## Route Structure

### Common Routes (All Roles)
```
/                      - Redirects to dashboard
/dashboard             - Main dashboard
/my-day                - Today's tasks
/important             - Important tasks
/planned               - Planned tasks
/assigned              - Assigned tasks
/meetings              - Meetings
/tasks                 - All tasks
```

### Management Routes

#### Projects
```
/projects              - Project list (SUPERADMIN, ADMIN, HOD, LEAD)
/projects/[id]         - Project details
/my-projects           - User's projects (ASSOCIATE)
```

#### Team
```
/team                  - Team list (HOD, LEAD)
/team/[id]             - Team member details
```

#### Users
```
/users                 - User list (SUPERADMIN, ADMIN)
/users/[id]            - User details
```

#### Departments
```
/departments           - Department list (SUPERADMIN, ADMIN)
/departments/[id]      - Department details
/department            - User's department (HOD)
```

#### Companies
```
/companies             - Company list (SUPERADMIN)
/companies/[id]        - Company details
```

#### Reports
```
/reports               - Reports (SUPERADMIN, ADMIN, HOD, LEAD)
/my-reports            - Personal reports (ASSOCIATE)
```

#### System
```
/analytics             - Analytics (SUPERADMIN, ADMIN)
/roles-permissions     - Roles & Permissions (SUPERADMIN)
/system-settings       - System Settings (SUPERADMIN)
/audit-logs            - Audit Logs (SUPERADMIN)
/integrations          - Integrations (SUPERADMIN)
```

## Page Structure

All placeholder pages follow this structure:

```tsx
'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';
import { RoleGuard } from '@/components/guards/RoleGuard';

export default function PageName() {
  return (
    <RoleGuard allowedRoles={['ROLE1', 'ROLE2']}>
      <div className="h-full overflow-auto p-6 bg-white dark:bg-slate-900">
        <PageHeader
          title="Page Title"
          description="Page description"
        />
        
        <div className="mt-6">
          <ComingSoon
            title="Module Name"
            description="Module description"
            features={[
              'Feature 1',
              'Feature 2',
            ]}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
```

## Adding New Routes

### 1. Add Route Configuration

Edit `config/routes.ts`:

```typescript
export const routes: Record<string, RouteConfig> = {
  // ... existing routes
  newRoute: {
    path: '/new-route',
    title: 'New Route',
    description: 'Description',
    roles: ['SUPERADMIN', 'ADMIN'],
  },
};
```

### 2. Add Navigation Item

Edit `config/navigation.ts`:

```typescript
const newNavItem: NavItem = {
  id: 'new-route',
  label: 'New Route',
  href: '/new-route',
  icon: 'IconName',  // Lucide React icon
  roles: ['SUPERADMIN', 'ADMIN'],
};

// Add to appropriate section
```

### 3. Create Page

Create `app/(main)/new-route/page.tsx`:

```tsx
'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { RoleGuard } from '@/components/guards/RoleGuard';

export default function NewRoutePage() {
  return (
    <RoleGuard allowedRoles={['SUPERADMIN', 'ADMIN']}>
      <div className="h-full overflow-auto p-6 bg-white dark:bg-slate-900">
        <PageHeader
          title="New Route"
          description="Description"
        />
        {/* Your content */}
      </div>
    </RoleGuard>
  );
}
```

## Design System

### Colors

Following enterprise color system:

- **Primary/Neutral:** Slate Gray (`slate-50` to `slate-900`)
- **Active/Selected:** Blue (`blue-50` to `blue-600`)
- **Success/Completed:** Emerald Green (`emerald-500`)
- **Destructive/Overdue:** Red (`red-600`)

### Typography

- **Page Title:** `text-2xl font-semibold`
- **Description:** `text-sm text-slate-600`
- **Section Label:** `text-xs font-semibold text-slate-400 uppercase`
- **Nav Item:** `text-sm font-medium`

### Spacing

- **Page Padding:** `p-6`
- **Section Gap:** `mt-6`
- **Nav Item Gap:** `space-y-0.5`

## Best Practices

1. **Always use RoleGuard** for route protection
2. **Use PageHeader** for consistent page headers
3. **Use ComingSoon** for placeholder pages
4. **Follow naming conventions** for routes and components
5. **Keep navigation config centralized** in `config/navigation.ts`
6. **Use Lucide React icons** for consistency
7. **Follow enterprise color system** for all UI elements
8. **Test with different roles** to ensure proper access control

## Testing

### Test Role Access

```typescript
import { hasRouteAccess } from '@/config/routes';

// Test if ADMIN can access /users
const canAccess = hasRouteAccess('/users', 'ADMIN'); // true
```

### Test Navigation

```typescript
import { getNavigationForRole } from '@/config/navigation';

// Get navigation for LEAD
const navigation = getNavigationForRole('LEAD');
```

## Future Enhancements

- [ ] Dynamic permission-based navigation
- [ ] Navigation search functionality
- [ ] Favorite/pinned routes
- [ ] Recent pages history
- [ ] Keyboard shortcuts for navigation
- [ ] Navigation analytics
- [ ] Custom user navigation preferences
