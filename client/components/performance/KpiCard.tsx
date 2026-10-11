'use client';

import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Kpi } from '@/services/performance.service';
import { formatKpiValue, ragClasses } from '@/lib/performanceFormat';

interface KpiCardProps {
  kpi: Kpi;
}

export function KpiCard({ kpi }: KpiCardProps) {
  const rag = ragClasses(kpi.status);

  // Improvement direction: a positive delta is "good" only when higherIsBetter.
  const hasDelta = kpi.delta !== null && kpi.delta !== 0;
  const improving = kpi.delta !== null && (kpi.higherIsBetter ? kpi.delta > 0 : kpi.delta < 0);
  const deltaTone = !hasDelta
    ? 'text-slate-400'
    : improving
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-rose-600 dark:text-rose-400';
  const DeltaIcon = !hasDelta ? Minus : kpi.delta! > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className={cn('border-l-4 gap-2', rag.border)}>
      <div className="flex items-start justify-between px-4 pt-1">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.label}</p>
        {kpi.status && (
          <span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', rag.dot)} aria-hidden />
        )}
      </div>

      <div className="flex items-end gap-2 px-4">
        <span className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          {formatKpiValue(kpi.value, kpi.unit)}
        </span>
        {kpi.previousValue !== null && (
          <span className={cn('mb-1 inline-flex items-center gap-0.5 text-xs font-medium', deltaTone)}>
            <DeltaIcon className="h-3.5 w-3.5" />
            {hasDelta ? `${Math.abs(kpi.delta!)}${kpi.unit === '%' ? 'pp' : ''}` : 'no change'}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between px-4 pb-1 text-xs text-slate-400">
        <span>
          {kpi.previousValue !== null
            ? `vs ${formatKpiValue(kpi.previousValue, kpi.unit)} prev.`
            : 'current snapshot'}
        </span>
        {kpi.target !== null && (
          <span className={cn('font-medium', rag.text)}>
            Target {formatKpiValue(kpi.target, kpi.unit)}
          </span>
        )}
      </div>
    </Card>
  );
}

export function KpiGrid({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((k) => (
        <KpiCard key={k.key} kpi={k} />
      ))}
    </div>
  );
}
