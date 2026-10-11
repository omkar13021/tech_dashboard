'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TeamMemberPage({ params }: { params: { id: string } }) {
  return (
    <RoleGuard allowedRoles={['HOD', 'LEAD']}>
      <div className="h-full overflow-auto p-6 bg-white dark:bg-slate-900">
        <PageHeader
          title={`Team Member #${params.id}`}
          description="View and manage team member details"
          actions={
            <Link href="/team">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Team
              </Button>
            </Link>
          }
        />
        
        <div className="mt-6">
          <ComingSoon
            title="Team Member Profile"
            description="Detailed team member view and management coming soon"
            features={[
              'View team member profile and contact information',
              'See assigned tasks and projects',
              'Track performance metrics',
              'Manage permissions and access',
              'View work history and contributions',
              'Send messages and notifications',
            ]}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
