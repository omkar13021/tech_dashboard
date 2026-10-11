'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';
import { PermissionRoute } from '@/components/authz/PermissionRoute';

export default function AnalyticsPage() {
  return (
    <PermissionRoute permission="report.view">
      <div className="h-full overflow-auto p-6 bg-white dark:bg-slate-900">
        <PageHeader
          title="Analytics"
          description="System analytics and insights"
        />
        
        <div className="mt-6">
          <ComingSoon
            title="Analytics Dashboard"
            description="Advanced analytics and insights coming soon"
            features={[
              'Real-time system performance metrics',
              'User activity and engagement analytics',
              'Project and task completion trends',
              'Resource utilization reports',
              'Predictive analytics and forecasting',
              'Custom dashboard widgets and charts',
            ]}
          />
        </div>
      </div>
    </PermissionRoute>
  );
}
