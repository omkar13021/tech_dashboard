'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';
import { PermissionRoute } from '@/components/authz/PermissionRoute';

export default function ProjectsPage() {
  return (
    <PermissionRoute permission="project.view">
      <div className="h-full overflow-auto p-6 bg-white dark:bg-slate-900">
        <PageHeader
          title="Projects"
          description="Manage and track all your projects"
        />
        
        <div className="mt-6">
          <ComingSoon
            title="Projects Module"
            description="Comprehensive project management system coming soon"
            features={[
              'Create and manage projects with detailed information',
              'Assign team members and track progress',
              'Set milestones and deadlines',
              'Track project budgets and resources',
              'Generate project reports and analytics',
              'Kanban and Gantt chart views',
            ]}
          />
        </div>
      </div>
    </PermissionRoute>
  );
}
