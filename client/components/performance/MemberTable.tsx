'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, ChevronsUpDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserAvatar, RoleBadge } from '@/components/users/user-display';
import { cn } from '@/lib/utils';
import { MemberRow, ResolvedTargets } from '@/services/performance.service';
import { kpiStatus, ragClasses } from '@/lib/performanceFormat';

interface MemberTableProps {
  members: MemberRow[];
  targets: ResolvedTargets;
}

type SortKey =
  | 'name'
  | 'completionRate'
  | 'onTimeRate'
  | 'cycleAvgDays'
  | 'completedTasks'
  | 'activeTasks'
  | 'overdueTasks';

const COLUMNS: { key: SortKey; label: string; numeric: boolean }[] = [
  { key: 'name', label: 'Member', numeric: false },
  { key: 'completionRate', label: 'Completion', numeric: true },
  { key: 'onTimeRate', label: 'On-time', numeric: true },
  { key: 'cycleAvgDays', label: 'Cycle', numeric: true },
  { key: 'completedTasks', label: 'Completed', numeric: true },
  { key: 'activeTasks', label: 'Active', numeric: true },
  { key: 'overdueTasks', label: 'Overdue', numeric: true },
];

function splitName(name: string): { firstName: string; lastName: string } {
  const [firstName, ...rest] = name.split(' ');
  return { firstName: firstName ?? name, lastName: rest.join(' ') };
}

function ragText(value: number, target: number | null, higherIsBetter: boolean): string {
  const status = kpiStatus(value, target, higherIsBetter);
  return status ? ragClasses(status).text : 'text-slate-700 dark:text-slate-200';
}

export function MemberTable({ members, targets }: MemberTableProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState('');
  const [sortKey, setSortKey] = React.useState<SortKey>('completionRate');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc');

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? members.filter(
          (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
        )
      : members;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [members, search, sortKey, sortDir]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Team members
        </h3>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member"
            className="h-9 pl-9"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 dark:bg-slate-800/40">
              {COLUMNS.map((col) => {
                const active = col.key === sortKey;
                const Icon = !active ? ChevronsUpDown : sortDir === 'asc' ? ArrowUp : ArrowDown;
                return (
                  <TableHead
                    key={col.key}
                    className={cn('pl-4', col.numeric && 'text-right')}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className={cn(
                        'inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide hover:text-slate-900 dark:hover:text-slate-100',
                        col.numeric && 'flex-row-reverse',
                        active ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500',
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {col.label}
                    </button>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={COLUMNS.length} className="py-10 text-center text-sm text-slate-400">
                  No members match your search.
                </TableCell>
              </TableRow>
            )}
            {rows.map((m) => (
              <TableRow
                key={m.id}
                className="cursor-pointer"
                onClick={() => router.push(`/performance/${m.id}`)}
              >
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={{ id: m.id, ...splitName(m.name), profileImage: m.profileImage }} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-slate-800 dark:text-slate-100">
                          {m.name}
                        </span>
                        <RoleBadge role={m.role} />
                      </div>
                      <p className="truncate text-xs text-slate-400">{m.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className={cn('text-right font-medium', ragText(m.completionRate, targets.completionRate, true))}>
                  {m.completionRate}%
                </TableCell>
                <TableCell className={cn('text-right font-medium', ragText(m.onTimeRate, targets.onTimeRate, true))}>
                  {m.onTimeRate}%
                </TableCell>
                <TableCell className={cn('text-right font-medium', ragText(m.cycleAvgDays, targets.cycleTimeDays, false))}>
                  {m.cycleAvgDays}d
                </TableCell>
                <TableCell className="text-right text-slate-700 dark:text-slate-200">
                  {m.completedTasks}
                </TableCell>
                <TableCell className="text-right text-slate-700 dark:text-slate-200">
                  {m.activeTasks}
                </TableCell>
                <TableCell className={cn('text-right font-medium', ragText(m.overdueTasks, targets.maxOverdue, false))}>
                  {m.overdueTasks}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
