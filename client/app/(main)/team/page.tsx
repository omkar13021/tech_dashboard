'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';
import { RoleGuard } from '@/components/guards/RoleGuard';

export default function TeamPage() {
  return (
    <RoleGuard allowedRoles={['HOD', 'LEAD']}>
      <div className="h-full overflow-auto p-6 bg-white dark:bg-slate-900">
        <PageHeader
          title="Team"
          description="Manage your team members"
        />
        
        <div className="mt-6">
          <ComingSoon
            title="Team Management"
            description="Comprehensive team management system coming soon"
            features={[
              'View all team members and their roles',
              'Assign tasks to team members',
              'Track team member performance',
              'Manage team schedules and availability',
              'View team workload distribution',
              'Team collaboration tools',
            ]}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
