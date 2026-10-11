'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';
import { PermissionRoute } from '@/components/authz/PermissionRoute';

export default function ReportsPage() {
  return (
    <PermissionRoute permission="report.view">
      <div className="h-full overflow-auto p-6 bg-white dark:bg-slate-900">
        <PageHeader
          title="Reports"
          description="View and generate reports"
        />
        
        <div className="mt-6">
          <ComingSoon
            title="Reports Module"
            description="Comprehensive reporting system coming soon"
            features={[
              'Generate custom reports with filters',
              'Schedule automated report delivery',
              'Export reports in multiple formats (PDF, Excel, CSV)',
              'Create report templates',
              'Share reports with team members',
              'Report history and versioning',
            ]}
          />
        </div>
      </div>
    </PermissionRoute>
  );
}
