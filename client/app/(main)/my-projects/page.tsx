'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';
import { RoleGuard } from '@/components/guards/RoleGuard';

export default function MyProjectsPage() {
  return (
    <RoleGuard allowedRoles={['ASSOCIATE']}>
      <div className="h-full overflow-auto p-6 bg-white dark:bg-slate-900">
        <PageHeader
          title="My Projects"
          description="Projects assigned to you"
        />
        
        <div className="mt-6">
          <ComingSoon
            title="My Projects"
            description="View and manage your assigned projects"
            features={[
              'View all projects you are assigned to',
              'Track your tasks within each project',
              'Update task status and progress',
              'View project timelines and deadlines',
              'Access project documents',
              'Communicate with project team',
            ]}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
