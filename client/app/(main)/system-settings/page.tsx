'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';
import { PermissionRoute } from '@/components/authz/PermissionRoute';

export default function SystemSettingsPage() {
  return (
    <PermissionRoute permission="settings.view">
      <div className="h-full overflow-auto p-6 bg-white dark:bg-slate-900">
        <PageHeader
          title="System Settings"
          description="Configure system settings"
        />
        
        <div className="mt-6">
          <ComingSoon
            title="System Settings"
            description="Comprehensive system configuration coming soon"
            features={[
              'General system configuration',
              'Email and notification settings',
              'Security and authentication settings',
              'Backup and restore options',
              'API and integration settings',
              'System maintenance and updates',
            ]}
          />
        </div>
      </div>
    </PermissionRoute>
  );
}
