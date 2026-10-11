# ERP Navigation - Quick Reference Guide

## 🚀 Quick Start

### Import Common Components
```tsx
import { PageHeader, Breadcrumbs, ComingSoon } from '@/components/common';
import { RoleGuard, PermissionGuard } from '@/components/guards';
```

### Create a New Page
```tsx
'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { RoleGuard } from '@/components/guards/RoleGuard';

export default function MyPage() {
  return (
    <RoleGuard allowedRoles={['SUPERADMIN']}>
      <div className="h-full overflow-auto p-6 bg-white dark:bg-slate-900">
        <PageHeader title="My Page" description="Description" />
        {/* Content */}
      </div>
    </RoleGuard>
  );
}
```

## 📋 Role Access Matrix

| Route | SUPERADMIN | ADMIN | HOD | LEAD | ASSOCIATE |
|-------|------------|-------|-----|------|-----------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| My Day | ✅ | ✅ | ✅ | ✅ | ✅ |
| Important | ✅ | ✅ | ✅ | ✅ | ✅ |
| Planned | ✅ | ✅ | ✅ | ✅ | ✅ |
| Assigned | ✅ | ✅ | ✅ | ✅ | ✅ |
| Meetings | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tasks | ✅ | ✅ | ✅ | ✅ | ✅ |
| Companies | ✅ | ❌ | ❌ | ❌ | ❌ |
| Users | ✅ | ✅ | ❌ | ❌ | ❌ |
| Departments | ✅ | ✅ | ❌ | ❌ | ❌ |
| Department | ❌ | ❌ | ✅ | ❌ | ❌ |
| Team | ❌ | ❌ | ✅ | ✅ | ❌ |
| Projects | ✅ | ✅ | ✅ | ✅ | ❌ |
| My Projects | ❌ | ❌ | ❌ | ❌ | ✅ |
| Reports | ✅ | ✅ | ✅ | ✅ | ❌ |
| My Reports | ❌ | ❌ | ❌ | ❌ | ✅ |
| Analytics | ✅ | ✅ | ❌ | ❌ | ❌ |
| Roles & Permissions | ✅ | ❌ | ❌ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| Audit Logs | ✅ | ❌ | ❌ | ❌ | ❌ |
| Integrations | ✅ | ❌ | ❌ | ❌ | ❌ |

## 🎨 Color Classes

### Backgrounds
```tsx
bg-white dark:bg-slate-900          // Page background
bg-slate-50 dark:bg-slate-800       // Card background
bg-slate-100 dark:bg-slate-800      // Hover state
bg-blue-50 dark:bg-blue-900/20      // Active state
```

### Text
```tsx
text-slate-900 dark:text-slate-100  // Primary text
text-slate-600 dark:text-slate-400  // Secondary text
text-slate-500 dark:text-slate-400  // Muted text
text-blue-600 dark:text-blue-400    // Active/Link text
```

### Borders
```tsx
border-slate-200 dark:border-slate-800  // Default border
border-blue-600                         // Active border
```

## 🧩 Component Patterns

### Page with Header and Actions
```tsx
<PageHeader
  title="Users"
  description="Manage system users"
  actions={
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Add User
    </Button>
  }
/>
```

### Page with Back Button
```tsx
<PageHeader
  title="User Details"
  actions={
    <Link href="/users">
      <Button variant="outline" size="sm" className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
    </Link>
  }
/>
```

### Placeholder Page
```tsx
<ComingSoon
  title="Module Name"
  description="Module description"
  features={[
    'Feature 1',
    'Feature 2',
    'Feature 3',
  ]}
/>
```

### Custom Breadcrumbs
```tsx
<Breadcrumbs items={[
  { label: 'Users', href: '/users' },
  { label: 'John Doe' }
]} />
```

## 🔒 Guard Patterns

### Single Role
```tsx
<RoleGuard allowedRoles={['SUPERADMIN']}>
  <SuperAdminContent />
</RoleGuard>
```

### Multiple Roles
```tsx
<RoleGuard allowedRoles={['SUPERADMIN', 'ADMIN', 'HOD']}>
  <ManagementContent />
</RoleGuard>
```

### Permission-Based
```tsx
<PermissionGuard requiredPermission="users.create">
  <CreateUserForm />
</PermissionGuard>
```

### Conditional Rendering
```tsx
const { user } = useAuth();

{user?.role === 'SUPERADMIN' && (
  <SuperAdminFeature />
)}
```

## 📁 File Structure

```
client/
├── app/(main)/
│   ├── projects/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── users/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   └── ...
├── components/
│   ├── common/
│   │   ├── Breadcrumbs.tsx
│   │   ├── PageHeader.tsx
│   │   ├── ComingSoon.tsx
│   │   └── index.ts
│   ├── guards/
│   │   ├── RoleGuard.tsx
│   │   ├── PermissionGuard.tsx
│   │   └── index.ts
│   └── layout/
│       ├── DynamicSidebar.tsx
│       └── AppLayout.tsx
└── config/
    ├── routes.ts
    └── navigation.ts
```

## 🔧 Configuration

### Add Route
```typescript
// config/routes.ts
newRoute: {
  path: '/new-route',
  title: 'New Route',
  description: 'Description',
  roles: ['SUPERADMIN', 'ADMIN'],
}
```

### Add Navigation Item
```typescript
// config/navigation.ts
{
  id: 'new-route',
  label: 'New Route',
  href: '/new-route',
  icon: 'IconName',  // Lucide React
  roles: ['SUPERADMIN', 'ADMIN'],
}
```

## 🎯 Common Icons

```tsx
import {
  LayoutDashboard,  // Dashboard
  Sun,              // My Day
  Star,             // Important
  Calendar,         // Planned
  UserCheck,        // Assigned
  Video,            // Meetings
  CheckSquare,      // Tasks
  Building2,        // Companies
  Users,            // Users/Team
  Building,         // Departments
  FolderKanban,     // Projects
  FileText,         // Reports
  BarChart3,        // Analytics
  Shield,           // Roles & Permissions
  Settings,         // Settings
  FileSearch,       // Audit Logs
  Plug,             // Integrations
  Plus,             // Add
  ArrowLeft,        // Back
  Search,           // Search
} from 'lucide-react';
```

## 📊 Utility Functions

### Check Route Access
```typescript
import { hasRouteAccess } from '@/config/routes';

const canAccess = hasRouteAccess('/users', userRole);
```

### Get Navigation
```typescript
import { getNavigationForRole } from '@/config/navigation';

const navigation = getNavigationForRole(userRole);
```

### Get Accessible Routes
```typescript
import { getAccessibleRoutes } from '@/config/routes';

const routes = getAccessibleRoutes(userRole);
```

## 🎨 Tailwind Classes Reference

### Layout
```
h-full              // Full height
overflow-auto       // Scrollable
p-6                 // Padding
mt-6                // Margin top
space-y-4           // Vertical spacing
gap-2               // Gap between items
```

### Flex
```
flex                // Flexbox
items-center        // Align center
justify-between     // Space between
flex-col            // Column direction
```

### Text
```
text-2xl            // Large text
text-sm             // Small text
text-xs             // Extra small
font-semibold       // Semi-bold
font-medium         // Medium weight
truncate            // Ellipsis overflow
uppercase           // Uppercase text
```

### Borders
```
border              // Border
border-l-2          // Left border
rounded-md          // Rounded corners
```

### Effects
```
hover:bg-slate-100  // Hover background
transition-colors   // Smooth transition
shadow-sm           // Small shadow
```

## 🔍 Debugging

### Check User Role
```tsx
const { user } = useAuth();
console.log('Current role:', user?.role);
```

### Check Permissions
```tsx
const { hasPermission } = usePermissions();
console.log('Can create users:', hasPermission('users.create'));
```

### Check Navigation
```tsx
const navigation = getNavigationForRole(user?.role);
console.log('Navigation items:', navigation);
```

## 📝 Notes

- Always use absolute paths for imports
- Use `'use client'` for client components
- Wrap pages with RoleGuard for protection
- Use PageHeader for consistent headers
- Follow enterprise color system
- Test with different roles
- Keep navigation config centralized
- Use Lucide React icons consistently

## 🆘 Common Issues

### Navigation not showing
- Check user role is set correctly
- Verify navigation config includes the role
- Check icon name is valid Lucide icon

### Route not protected
- Ensure RoleGuard wraps the page
- Verify allowedRoles array is correct
- Check route config has correct roles

### Breadcrumbs not showing
- Set `showBreadcrumbs={true}` in PageHeader
- Or use `<Breadcrumbs />` directly

### Icons not loading
- Verify icon name matches Lucide React
- Check import in DynamicSidebar
- Use exact icon name from Lucide docs
