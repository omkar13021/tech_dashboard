'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';
import { RoleGuard } from '@/components/guards/RoleGuard';

export default function MyReportsPage() {
  return (
    <RoleGuard allowedRoles={['ASSOCIATE']}>
      <div className="h-full overflow-auto p-6 bg-white dark:bg-slate-900">
        <PageHeader
          title="My Reports"
          description="Your personal reports"
        />
        
        <div className="mt-6">
          <ComingSoon
            title="My Reports"
            description="Personal reporting dashboard coming soon"
            features={[
              'View your task completion reports',
              'Track your time and productivity',
              'Generate personal performance reports',
              'Export your work history',
              'View project contribution summaries',
              'Access saved report templates',
            ]}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
