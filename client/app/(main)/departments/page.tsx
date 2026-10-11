'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';
import { RoleGuard } from '@/components/guards/RoleGuard';

export default function DepartmentsPage() {
  return (
    <RoleGuard allowedRoles={['SUPERADMIN', 'ADMIN']}>
      <div className="h-full overflow-auto p-6 bg-white dark:bg-slate-900">
        <PageHeader
          title="Departments"
          description="Manage organizational departments"
        />
        
        <div className="mt-6">
          <ComingSoon
            title="Department Management"
            description="Comprehensive department management system coming soon"
            features={[
              'Create and manage departments',
              'Assign department heads and managers',
              'View department structure and hierarchy',
              'Manage department budgets and resources',
              'Track department performance metrics',
              'Department-level reporting and analytics',
            ]}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
