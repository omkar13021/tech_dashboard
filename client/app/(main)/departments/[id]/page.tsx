'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DepartmentDetailPage({ params }: { params: { id: string } }) {
  return (
    <RoleGuard allowedRoles={['SUPERADMIN', 'ADMIN']}>
      <div className="h-full overflow-auto p-6 bg-white dark:bg-slate-900">
        <PageHeader
          title={`Department #${params.id}`}
          description="View and manage department details"
          actions={
            <Link href="/departments">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Departments
              </Button>
            </Link>
          }
        />
        
        <div className="mt-6">
          <ComingSoon
            title="Department Details"
            description="Detailed department view and management coming soon"
            features={[
              'View department information and structure',
              'Manage department members and roles',
              'Track department projects and tasks',
              'View department budget and expenses',
              'Generate department reports',
              'Department performance analytics',
            ]}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
