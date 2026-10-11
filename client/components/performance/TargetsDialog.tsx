'use client';

import React from 'react';
import { toast } from 'sonner';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchTargets, saveTarget, resetTarget } from '@/store/slices/performanceSlice';
import { departmentLabel } from '@/lib/performanceFormat';
import {
  Department,
  KpiTargetRecord,
  SetTargetPayload,
} from '@/services/performance.service';

const GLOBAL_SCOPE = 'GLOBAL';

interface FieldDef {
  key: 'completionRate' | 'onTimeRate' | 'maxOverdue' | 'cycleTimeDays';
  label: string;
  suffix: string;
  max?: number;
}

const FIELDS: FieldDef[] = [
  { key: 'completionRate', label: 'Completion rate', suffix: '%', max: 100 },
  { key: 'onTimeRate', label: 'On-time rate', suffix: '%', max: 100 },
  { key: 'maxOverdue', label: 'Max overdue', suffix: 'tasks' },
  { key: 'cycleTimeDays', label: 'Cycle time', suffix: 'days' },
];

interface TargetsDialogProps {
  /** Called after a successful save/reset so the dashboard can refresh RAG status. */
  onSaved?: () => void;
}

export function TargetsDialog({ onSaved }: TargetsDialogProps) {
  const dispatch = useAppDispatch();
  const { targets, isTargetsLoading } = useAppSelector((s) => s.performance);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (open) dispatch(fetchTargets());
  }, [open, dispatch]);

  const caps = targets?.capabilities;
  const scopeOptions = React.useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    if (caps?.canManageGlobal) opts.push({ value: GLOBAL_SCOPE, label: 'Global (org-wide)' });
    for (const d of caps?.manageableDepartments ?? []) {
      opts.push({ value: d, label: departmentLabel(d) });
    }
    return opts;
  }, [caps]);

  const [scope, setScope] = React.useState<string>('');
  // Default the scope once options are known.
  const effectiveScope = scope || scopeOptions[0]?.value || '';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Target className="h-4 w-4" />
          Targets
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Performance targets</DialogTitle>
          <DialogDescription>
            Set the goals used to colour KPIs. Department targets override the global default.
          </DialogDescription>
        </DialogHeader>

        {isTargetsLoading && !targets ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : scopeOptions.length === 0 ? (
          <p className="py-4 text-sm text-slate-500">You don&apos;t have any targets to manage.</p>
        ) : (
          <div className="space-y-4">
            {scopeOptions.length > 1 && (
              <div className="space-y-1.5">
                <Label>Scope</Label>
                <Select value={effectiveScope} onValueChange={setScope}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scopeOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <TargetForm
              key={effectiveScope}
              scope={effectiveScope}
              global={targets?.global ?? null}
              departments={targets?.departments ?? []}
              onSaved={() => {
                onSaved?.();
              }}
              onClose={() => setOpen(false)}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface TargetFormProps {
  scope: string;
  global: KpiTargetRecord | null;
  departments: KpiTargetRecord[];
  onSaved: () => void;
  onClose: () => void;
}

function TargetForm({ scope, global, departments, onSaved, onClose }: TargetFormProps) {
  const dispatch = useAppDispatch();
  const isSaving = useAppSelector((s) => s.performance.isSavingTarget);

  const isGlobal = scope === GLOBAL_SCOPE;
  const department = (isGlobal ? null : scope) as Department | null;
  const existing = isGlobal ? global : departments.find((d) => d.department === department) ?? null;

  // Fresh state per scope (component is keyed by scope, so this initialises cleanly).
  const initial = (k: FieldDef['key']) =>
    existing?.[k] !== null && existing?.[k] !== undefined ? String(existing[k]) : '';
  const [values, setValues] = React.useState<Record<string, string>>({
    completionRate: initial('completionRate'),
    onTimeRate: initial('onTimeRate'),
    maxOverdue: initial('maxOverdue'),
    cycleTimeDays: initial('cycleTimeDays'),
  });

  const allEmpty = FIELDS.every((f) => values[f.key].trim() === '');
  const hasOverride = !isGlobal && existing !== null;

  const handleSave = async () => {
    const payload: SetTargetPayload = { scope: isGlobal ? 'GLOBAL' : 'DEPARTMENT' };
    if (department) payload.department = department;
    for (const f of FIELDS) {
      const raw = values[f.key].trim();
      payload[f.key] = raw === '' ? null : Number(raw);
    }
    try {
      await dispatch(saveTarget(payload)).unwrap();
      toast.success('Targets saved');
      onSaved();
      onClose();
    } catch (e) {
      toast.error('Could not save targets', { description: String(e) });
    }
  };

  const handleReset = async () => {
    try {
      await dispatch(
        resetTarget({
          scope: isGlobal ? 'GLOBAL' : 'DEPARTMENT',
          ...(department ? { department } : {}),
        }),
      ).unwrap();
      toast.success(isGlobal ? 'Global target cleared' : 'Override removed');
      onSaved();
      onClose();
    } catch (e) {
      toast.error('Could not reset', { description: String(e) });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map((f) => {
          const inherited = !isGlobal ? global?.[f.key] : null;
          return (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={`target-${f.key}`} className="text-xs">
                {f.label} <span className="text-slate-400">({f.suffix})</span>
              </Label>
              <Input
                id={`target-${f.key}`}
                type="number"
                min={0}
                max={f.max}
                inputMode="numeric"
                value={values[f.key]}
                placeholder={
                  inherited !== null && inherited !== undefined
                    ? `Inherits ${inherited}`
                    : 'No target'
                }
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                className="h-9"
              />
            </div>
          );
        })}
      </div>

      {!isGlobal && (
        <p className="text-xs text-slate-400">
          Leave a field blank to inherit the global value for that metric.
        </p>
      )}

      <div className="flex items-center justify-between gap-2 pt-1">
        <div>
          {(isGlobal ? existing !== null : hasOverride) && (
            <Button variant="ghost" size="sm" onClick={handleReset} disabled={isSaving}>
              {isGlobal ? 'Clear all' : 'Remove override'}
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving || allEmpty}>
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
