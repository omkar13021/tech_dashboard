'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CompanyDetailPage({ params }: { params: { id: string } }) {
  return (
    <RoleGuard allowedRoles={['SUPERADMIN']}>
      <div className="h-full overflow-auto p-6 bg-white dark:bg-slate-900">
        <PageHeader
          title={`Company #${params.id}`}
          description="View and manage company details"
          actions={
            <Link href="/companies">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Companies
              </Button>
            </Link>
          }
        />
        
        <div className="mt-6">
          <ComingSoon
            title="Company Details"
            description="Detailed company view and management coming soon"
            features={[
              'View company profile and information',
              'Manage company users and departments',
              'Configure company settings and preferences',
              'View subscription and billing details',
              'Monitor company usage and activity',
              'Generate company-wide reports',
            ]}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
