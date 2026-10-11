'use client';

import React from 'react';
import { AlertCircle, Users } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { PermissionRoute } from '@/components/authz/PermissionRoute';
import { PermissionGate } from '@/components/authz/PermissionGate';
import { Card } from '@/components/ui/card';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchTeamDashboard } from '@/store/slices/performanceSlice';
import {
  PerformanceFilters,
  PerformanceFilterValue,
} from '@/components/performance/PerformanceFilters';
import { KpiGrid } from '@/components/performance/KpiCard';
import { PerformanceCharts } from '@/components/performance/PerformanceCharts';
import { MemberTable } from '@/components/performance/MemberTable';
import { TargetsDialog } from '@/components/performance/TargetsDialog';
import { ExportMenu } from '@/components/performance/ExportMenu';
import { departmentLabel } from '@/lib/performanceFormat';
import { downloadCsv } from '@/lib/exportCsv';
import { PerformanceQueryParams } from '@/services/performance.service';

const DEFAULT_FILTERS: PerformanceFilterValue = {
  range: '30d',
  from: '',
  to: '',
  department: null,
};

/** Translate UI filters into API query params (omit incomplete custom ranges). */
function toParams(f: PerformanceFilterValue): PerformanceQueryParams {
  const params: PerformanceQueryParams = { range: f.range };
  if (f.range === 'custom') {
    if (f.from) params.from = new Date(f.from).toISOString();
    if (f.to) params.to = new Date(f.to + 'T23:59:59').toISOString();
  }
  if (f.department) params.department = f.department;
  return params;
}

function PerformancePageInner() {
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.auth.user?.role);
  const { dashboard, isDashboardLoading, dashboardError, lastUpdated } = useAppSelector(
    (s) => s.performance,
  );

  const [filters, setFilters] = React.useState<PerformanceFilterValue>(DEFAULT_FILTERS);

  const isOrgAdmin = role === 'ADMIN' || role === 'SUPERADMIN';

  // A custom range only queries once both ends are picked.
  const ready = filters.range !== 'custom' || (!!filters.from && !!filters.to);

  const load = React.useCallback(() => {
    if (!ready) return;
    dispatch(fetchTeamDashboard(toParams(filters)));
  }, [dispatch, filters, ready]);

  React.useEffect(() => {
    load();
  }, [load]);

  const scope = dashboard?.scope;

  const handleExportCsv = React.useCallback(() => {
    if (!dashboard) return;
    const meta = [
      ['Team Performance'],
      ['Scope', departmentLabel(dashboard.scope.department)],
      [
        'Period',
        `${dashboard.scope.range.from.slice(0, 10)} to ${dashboard.scope.range.to.slice(0, 10)}`,
      ],
      [],
    ];
    const header = [
      'Member',
      'Email',
      'Role',
      'Department',
      'Completion %',
      'On-time %',
      'Cycle (days)',
      'Completed',
      'Active',
      'Overdue',
      'Last active',
    ];
    const rows = dashboard.members.map((m) => [
      m.name,
      m.email,
      m.role,
      m.department ?? '',
      m.completionRate,
      m.onTimeRate,
      m.cycleAvgDays,
      m.completedTasks,
      m.activeTasks,
      m.overdueTasks,
      m.lastActiveAt ? m.lastActiveAt.slice(0, 10) : '',
    ]);
    downloadCsv(`team-performance-${dashboard.scope.range.preset}`, [...meta, header, ...rows]);
  }, [dashboard]);

  return (
    <div className="h-full overflow-auto bg-white p-6 dark:bg-slate-900">
      <div className="perf-print-area mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="Team Performance"
          description="Workload, throughput, timeliness and engagement across your team."
          actions={
            <div className="flex items-center gap-2 no-print">
              <ExportMenu onDownloadCsv={handleExportCsv} csvLabel="Members CSV" disabled={!dashboard} />
              <PermissionGate permission="performance.manage_targets">
                <TargetsDialog onSaved={load} />
              </PermissionGate>
            </div>
          }
        />

        <div className="no-print">
          <PerformanceFilters
            value={filters}
            onChange={setFilters}
            showDepartment={isOrgAdmin}
            onRefresh={load}
            isLoading={isDashboardLoading}
            lastUpdated={lastUpdated}
          />
        </div>

        {scope && (
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Users className="h-4 w-4" />
            <span>
              {departmentLabel(scope.department)} · {scope.memberCount}{' '}
              {scope.memberCount === 1 ? 'member' : 'members'}
            </span>
          </div>
        )}

        {dashboardError && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {dashboardError}
          </div>
        )}

        {isDashboardLoading && !dashboard ? (
          <DashboardSkeleton />
        ) : dashboard ? (
          dashboard.scope.memberCount === 0 ? (
            <EmptyScope />
          ) : (
            <div className="space-y-6">
              <KpiGrid kpis={dashboard.kpis} />
              <PerformanceCharts dashboard={dashboard} />
              <MemberTable members={dashboard.members} targets={dashboard.targets} />
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
        />
      ))}
    </div>
  );
}

function EmptyScope() {
  return (
    <Card className="items-center justify-center gap-2 py-12 text-center">
      <Users className="h-8 w-8 text-slate-300" />
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
        No team members in scope
      </p>
      <p className="max-w-sm text-sm text-slate-400">
        You don&apos;t have any direct reports or department members yet, so there&apos;s nothing to
        report on.
      </p>
    </Card>
  );
}

export default function PerformancePage() {
  return (
    <PermissionRoute permission="performance.view">
      <PerformancePageInner />
    </PermissionRoute>
  );
}
