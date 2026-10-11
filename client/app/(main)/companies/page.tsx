'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';
import { RoleGuard } from '@/components/guards/RoleGuard';

export default function CompaniesPage() {
  return (
    <RoleGuard allowedRoles={['SUPERADMIN']}>
      <div className="h-full overflow-auto p-6 bg-white dark:bg-slate-900">
        <PageHeader
          title="Companies"
          description="Manage companies in the system"
        />
        
        <div className="mt-6">
          <ComingSoon
            title="Company Management"
            description="Multi-tenant company management system coming soon"
            features={[
              'Create and manage multiple companies',
              'Configure company-specific settings',
              'Manage company subscriptions and billing',
              'View company usage and analytics',
              'Company-level user and role management',
              'Data isolation and security controls',
            ]}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
