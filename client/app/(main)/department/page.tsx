'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';
import { RoleGuard } from '@/components/guards/RoleGuard';

export default function DepartmentPage() {
  return (
    <RoleGuard allowedRoles={['HOD']}>
      <div className="h-full overflow-auto p-6 bg-white dark:bg-slate-900">
        <PageHeader
          title="Department"
          description="Your department overview"
        />
        
        <div className="mt-6">
          <ComingSoon
            title="Department Dashboard"
            description="Comprehensive department overview coming soon"
            features={[
              'View department overview and statistics',
              'Monitor team performance and productivity',
              'Track ongoing projects and tasks',
              'Manage department resources',
              'View department calendar and schedules',
              'Access department reports and analytics',
            ]}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
