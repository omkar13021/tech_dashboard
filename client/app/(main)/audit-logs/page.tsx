'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';
import { RoleGuard } from '@/components/guards/RoleGuard';

export default function AuditLogsPage() {
  return (
    <RoleGuard allowedRoles={['SUPERADMIN']}>
      <div className="h-full overflow-auto p-6 bg-white dark:bg-slate-900">
        <PageHeader
          title="Audit Logs"
          description="System audit trail"
        />
        
        <div className="mt-6">
          <ComingSoon
            title="Audit Logs"
            description="Comprehensive audit logging system coming soon"
            features={[
              'View all system activities and changes',
              'Filter logs by user, action, and date',
              'Export audit logs for compliance',
              'Real-time activity monitoring',
              'Security event tracking',
              'Detailed change history',
            ]}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
