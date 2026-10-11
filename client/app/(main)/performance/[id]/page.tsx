'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { AlertCircle, ArrowLeft, Clock } from 'lucide-react';
import { PermissionRoute } from '@/components/authz/PermissionRoute';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserAvatar, RoleBadge, StatusBadge } from '@/components/users/user-display';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchMemberDetail, clearMemberDetail } from '@/store/slices/performanceSlice';
import {
  PerformanceFilters,
  PerformanceFilterValue,
} from '@/components/performance/PerformanceFilters';
import { KpiGrid } from '@/components/performance/KpiCard';
import { ThroughputChart } from '@/components/performance/charts/ThroughputChart';
import { StatusDonut } from '@/components/performance/charts/StatusDonut';
import { PriorityBar } from '@/components/performance/charts/PriorityBar';
import { ExportMenu } from '@/components/performance/ExportMenu';
import { downloadCsv } from '@/lib/exportCsv';
import {
  departmentLabel,
  statusMeta,
  priorityMeta,
} from '@/lib/performanceFormat';
import {
  PerformanceQueryParams,
  RecentTask,
} from '@/services/performance.service';

const DEFAULT_FILTERS: PerformanceFilterValue = {
  range: '30d',
  from: '',
  to: '',
  department: null,
};

function toParams(memberId: string, f: PerformanceFilterValue): PerformanceQueryParams {
  const params: PerformanceQueryParams = { memberId, range: f.range };
  if (f.range === 'custom') {
    if (f.from) params.from = new Date(f.from).toISOString();
    if (f.to) params.to = new Date(f.to + 'T23:59:59').toISOString();
  }
  return params;
}

function fmt(value: string | null): string {
  if (!value) return '—';
  try {
    return format(parseISO(value), 'MMM d, yyyy');
  } catch {
    return value;
  }
}

function Dot({ color }: { color: string }) {
  return <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden />;
}

function RecentTasksTable({ tasks }: { tasks: RecentTask[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Recent tasks</h3>
      <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 dark:bg-slate-800/40">
              <TableHead className="pl-4">Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Completed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-400">
                  No tasks yet.
                </TableCell>
              </TableRow>
            )}
            {tasks.map((t) => {
              const s = statusMeta(t.status);
              const p = priorityMeta(t.priority);
              return (
                <TableRow key={t.id}>
                  <TableCell className="max-w-xs truncate pl-4 font-medium text-slate-800 dark:text-slate-100">
                    {t.title}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                      <Dot color={s.color} />
                      {s.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                      <Dot color={p.color} />
                      {p.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                    {fmt(t.dueDate)}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                    {fmt(t.completedAt)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function MemberDetailInner({ memberId }: { memberId: string }) {
  const dispatch = useAppDispatch();
  const { memberDetail, isMemberLoading, memberError } = useAppSelector((s) => s.performance);
  const [filters, setFilters] = React.useState<PerformanceFilterValue>(DEFAULT_FILTERS);

  const ready = filters.range !== 'custom' || (!!filters.from && !!filters.to);

  const load = React.useCallback(() => {
    if (!ready) return;
    dispatch(fetchMemberDetail(toParams(memberId, filters)));
  }, [dispatch, memberId, filters, ready]);

  React.useEffect(() => {
    load();
    return () => {
      dispatch(clearMemberDetail());
    };
  }, [load, dispatch]);

  const member = memberDetail?.member;

  const handleExportCsv = React.useCallback(() => {
    if (!memberDetail) return;
    const m = memberDetail.member;
    const meta = [
      [`Performance — ${m.firstName} ${m.lastName}`],
      ['Email', m.email],
      [
        'Period',
        `${memberDetail.scope.range.from.slice(0, 10)} to ${memberDetail.scope.range.to.slice(0, 10)}`,
      ],
      [],
      ['Recent tasks'],
    ];
    const header = ['Title', 'Status', 'Priority', 'Due', 'Completed', 'Created'];
    const rows = memberDetail.recentTasks.map((t) => [
      t.title,
      statusMeta(t.status).label,
      priorityMeta(t.priority).label,
      t.dueDate ? t.dueDate.slice(0, 10) : '',
      t.completedAt ? t.completedAt.slice(0, 10) : '',
      t.createdAt.slice(0, 10),
    ]);
    downloadCsv(`performance-${m.firstName}-${m.lastName}`.toLowerCase(), [
      ...meta,
      header,
      ...rows,
    ]);
  }, [memberDetail]);

  return (
    <div className="h-full overflow-auto bg-white p-6 dark:bg-slate-900">
      <div className="perf-print-area mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between no-print">
          <Link
            href="/performance"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to team
          </Link>
          <ExportMenu
            onDownloadCsv={handleExportCsv}
            csvLabel="Tasks CSV"
            disabled={!memberDetail}
          />
        </div>

        {member && (
          <Card className="gap-0">
            <div className="flex flex-col gap-4 px-4 py-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <UserAvatar
                  user={{
                    id: member.id,
                    firstName: member.firstName,
                    lastName: member.lastName,
                    profileImage: member.profileImage,
                  }}
                  className="h-12 w-12"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                      {member.firstName} {member.lastName}
                    </h1>
                    <RoleBadge role={member.role} />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {member.email} · {departmentLabel(member.department)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={member.isActive ? 'ACTIVE' : 'INACTIVE'} />
                {member.lastActiveAt && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    Active {fmt(member.lastActiveAt)}
                  </span>
                )}
              </div>
            </div>
          </Card>
        )}

        <div className="no-print">
          <PerformanceFilters
            value={filters}
            onChange={setFilters}
            showDepartment={false}
            onRefresh={load}
            isLoading={isMemberLoading}
          />
        </div>

        {memberError && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {memberError}
          </div>
        )}

        {isMemberLoading && !memberDetail ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : memberDetail ? (
          <div className="space-y-6">
            <KpiGrid kpis={memberDetail.kpis} />
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ThroughputChart data={memberDetail.trend} />
              </div>
              <StatusDonut data={memberDetail.distributions.status} />
            </div>
            <PriorityBar data={memberDetail.distributions.priority} />
            <RecentTasksTable tasks={memberDetail.recentTasks} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function MemberPerformancePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  return (
    <PermissionRoute permission="performance.view">
      {id ? <MemberDetailInner memberId={id} /> : null}
    </PermissionRoute>
  );
}
