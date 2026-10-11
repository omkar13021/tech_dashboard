'use client';

import { TeamDashboard } from '@/services/performance.service';
import { ThroughputChart } from './charts/ThroughputChart';
import { StatusDonut } from './charts/StatusDonut';
import { PriorityBar } from './charts/PriorityBar';
import { WorkloadChart } from './charts/WorkloadChart';

interface PerformanceChartsProps {
  dashboard: TeamDashboard;
}

export function PerformanceCharts({ dashboard }: PerformanceChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <ThroughputChart data={dashboard.trend} />
      </div>
      <StatusDonut data={dashboard.distributions.status} />

      <PriorityBar data={dashboard.distributions.priority} />
      <div className="lg:col-span-2">
        <WorkloadChart data={dashboard.workload} />
      </div>
    </div>
  );
}
