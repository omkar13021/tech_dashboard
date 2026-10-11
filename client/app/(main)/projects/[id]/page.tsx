'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return (
    <RoleGuard allowedRoles={['SUPERADMIN', 'ADMIN', 'HOD', 'LEAD']}>
      <div className="h-full overflow-auto p-6 bg-white dark:bg-slate-900">
        <PageHeader
          title={`Project #${params.id}`}
          description="View and manage project details"
          actions={
            <Link href="/projects">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Projects
              </Button>
            </Link>
          }
        />
        
        <div className="mt-6">
          <ComingSoon
            title="Project Details"
            description="Detailed project view and management coming soon"
            features={[
              'View comprehensive project information',
              'Manage project tasks and subtasks',
              'Track team member contributions',
              'Monitor project timeline and milestones',
              'View project documents and files',
              'Collaborate with team members',
            ]}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
