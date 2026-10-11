'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';
import { RoleGuard } from '@/components/guards/RoleGuard';

export default function IntegrationsPage() {
  return (
    <RoleGuard allowedRoles={['SUPERADMIN']}>
      <div className="h-full overflow-auto p-6 bg-white dark:bg-slate-900">
        <PageHeader
          title="Integrations"
          description="Third-party integrations"
        />
        
        <div className="mt-6">
          <ComingSoon
            title="Integrations"
            description="Connect with your favorite tools coming soon"
            features={[
              'Connect with popular productivity tools',
              'API key management',
              'Webhook configuration',
              'OAuth app connections',
              'Integration marketplace',
              'Custom integration builder',
            ]}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
