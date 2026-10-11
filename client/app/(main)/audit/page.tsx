'use client';

import React from 'react';
import { format, parseISO } from 'date-fns';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { PermissionRoute } from '@/components/authz/PermissionRoute';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { queryAudit } from '@/store/slices/auditSlice';
import { AuditLogEntry } from '@/services/audit.service';

const PAGE_SIZE = 25;
const ALL = 'ALL';

const ENTITY_OPTIONS = [
  { value: ALL, label: 'All entities' },
  { value: 'user', label: 'Users' },
  { value: 'role', label: 'Roles' },
  { value: 'assistant', label: 'Assistants' },
  { value: 'auth', label: 'Auth / Sessions' },
];

function actionTone(action: string): string {
  const a = action.toLowerCase();
  if (a.includes('delete') || a.includes('deactivate') || a.includes('revoke') || a.includes('failed'))
    return 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300';
  if (a.includes('create') || a.includes('activate') || a.includes('grant') || a.includes('login'))
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300';
  return 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300';
}

function ValueBlock({ title, data }: { title: string; data?: Record<string, unknown> | null }) {
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      <div className="rounded-md bg-muted/50 p-2 text-xs">
        {Object.entries(data).map(([k, v]) => (
          <div key={k} className="flex gap-2 py-0.5">
            <span className="font-medium text-slate-600 dark:text-slate-300">{k}:</span>
            <span className="break-all text-slate-500">
              {typeof v === 'object' ? JSON.stringify(v) : String(v)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditPageInner() {
  const dispatch = useAppDispatch();
  const { logs, meta, isLoading } = useAppSelector((s) => s.audit);

  const [search, setSearch] = React.useState('');
  const [debounced, setDebounced] = React.useState('');
  const [entityType, setEntityType] = React.useState<string>(ALL);
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<AuditLogEntry | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  React.useEffect(() => {
    dispatch(
      queryAudit({
        search: debounced || undefined,
        entityType: entityType !== ALL ? entityType : undefined,
        dateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
        dateTo: dateTo ? new Date(dateTo + 'T23:59:59').toISOString() : undefined,
        page,
        limit: PAGE_SIZE,
      }),
    );
  }, [dispatch, debounced, entityType, dateFrom, dateTo, page]);

  const actorName = (e: AuditLogEntry) =>
    e.actor ? `${e.actor.firstName} ${e.actor.lastName}` : 'System';

  return (
    <div className="h-full overflow-auto bg-white p-6 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          title="Audit Logs"
          description="A complete, filterable trail of every sensitive action across the platform."
        />

        {/* Filters */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search action / entity"
              className="h-9 pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={entityType}
              onValueChange={(v) => {
                setEntityType(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="h-9 w-[150px]"
              aria-label="From date"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="h-9 w-[150px]"
              aria-label="To date"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 dark:bg-slate-800/40">
                <TableHead className="pl-4">Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoading && logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-400">
                    No audit entries match your filters.
                  </TableCell>
                </TableRow>
              )}
              {logs.map((e) => (
                <TableRow key={e.id} className="cursor-pointer" onClick={() => setSelected(e)}>
                  <TableCell className="pl-4">
                    <Badge variant="secondary" className={`border-transparent font-medium ${actionTone(e.action)}`}>
                      {e.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">
                    {e.entityType ?? '—'}
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{actorName(e)}</TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {e.ipAddress ?? '—'}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {format(parseISO(e.createdAt), 'MMM d, yyyy · h:mm a')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Page {meta.page} of {meta.totalPages} · {meta.total} entries
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail dialog */}
      <Dialog open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant="secondary" className={`border-transparent ${selected ? actionTone(selected.action) : ''}`}>
                {selected?.action}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400">Actor</p>
                  <p className="text-slate-700 dark:text-slate-200">{actorName(selected)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Entity</p>
                  <p className="text-slate-700 dark:text-slate-200">
                    {selected.entityType ?? '—'} {selected.entityId ? `· ${selected.entityId}` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">When</p>
                  <p className="text-slate-700 dark:text-slate-200">
                    {format(parseISO(selected.createdAt), 'PPpp')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">IP / Device</p>
                  <p className="break-all text-slate-700 dark:text-slate-200">
                    {selected.ipAddress ?? '—'}
                  </p>
                </div>
              </div>
              {(selected.oldValues || selected.newValues || selected.metadata) && <Separator />}
              <ValueBlock title="Before" data={selected.oldValues} />
              <ValueBlock title="After" data={selected.newValues} />
              <ValueBlock title="Details" data={selected.metadata} />
              {selected.userAgent && (
                <p className="break-all text-xs text-slate-400">{selected.userAgent}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AuditPage() {
  return (
    <PermissionRoute permission="audit.view">
      <AuditPageInner />
    </PermissionRoute>
  );
}
