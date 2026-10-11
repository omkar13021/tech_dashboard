'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Show an empty-state message instead of the chart. */
  isEmpty?: boolean;
  emptyLabel?: string;
  className?: string;
  children: React.ReactNode;
}

export function ChartCard({
  title,
  description,
  action,
  isEmpty,
  emptyLabel = 'No data for this period',
  className,
  children,
}: ChartCardProps) {
  return (
    <Card className={cn('gap-3', className)}>
      <div className="flex items-start justify-between px-4 pt-1">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          {description && (
            <p className="text-xs text-slate-400">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="px-2 pb-2">
        {isEmpty ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-slate-400">
            {emptyLabel}
          </div>
        ) : (
          children
        )}
      </div>
    </Card>
  );
}
