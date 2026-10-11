'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Department, PerfRange, DEPARTMENTS } from '@/services/performance.service';
import { RANGE_OPTIONS, departmentLabel } from '@/lib/performanceFormat';

const ALL_DEPTS = 'ALL';

export interface PerformanceFilterValue {
  range: PerfRange;
  from: string;
  to: string;
  department: Department | null;
}

interface PerformanceFiltersProps {
  value: PerformanceFilterValue;
  onChange: (next: PerformanceFilterValue) => void;
  /** Show the department selector (Admin / Superadmin only). */
  showDepartment: boolean;
  onRefresh: () => void;
  isLoading?: boolean;
  lastUpdated?: string | null;
}

export function PerformanceFilters({
  value,
  onChange,
  showDepartment,
  onRefresh,
  isLoading,
  lastUpdated,
}: PerformanceFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={value.range}
          onValueChange={(v) => onChange({ ...value, range: v as PerfRange })}
        >
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {value.range === 'custom' && (
          <>
            <Input
              type="date"
              value={value.from}
              max={value.to || undefined}
              onChange={(e) => onChange({ ...value, from: e.target.value })}
              className="h-9 w-[150px]"
              aria-label="From date"
            />
            <span className="text-sm text-slate-400">to</span>
            <Input
              type="date"
              value={value.to}
              min={value.from || undefined}
              onChange={(e) => onChange({ ...value, to: e.target.value })}
              className="h-9 w-[150px]"
              aria-label="To date"
            />
          </>
        )}

        {showDepartment && (
          <Select
            value={value.department ?? ALL_DEPTS}
            onValueChange={(v) =>
              onChange({ ...value, department: v === ALL_DEPTS ? null : (v as Department) })
            }
          >
            <SelectTrigger className="h-9 w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_DEPTS}>All departments</SelectItem>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>
                  {departmentLabel(d)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex items-center gap-3">
        {lastUpdated && (
          <span className="text-xs text-slate-400">
            Updated {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>
    </div>
  );
}
