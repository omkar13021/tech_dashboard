'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';
import { RoleGuard } from '@/components/guards/RoleGuard';

export default function RolesPermissionsPage() {
  return (
    <RoleGuard allowedRoles={['SUPERADMIN']}>
      <div className="h-full overflow-auto p-6 bg-white dark:bg-slate-900">
        <PageHeader
          title="Roles & Permissions"
          description="Manage roles and permissions"
        />
        
        <div className="mt-6">
          <ComingSoon
            title="Roles & Permissions Management"
            description="Advanced role-based access control coming soon"
            features={[
              'Create and manage custom roles',
              'Define granular permissions',
              'Assign roles to users',
              'Role hierarchy and inheritance',
              'Permission templates and presets',
              'Audit role changes and assignments',
            ]}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
