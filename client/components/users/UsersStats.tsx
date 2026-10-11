'use client';

import React from 'react';
import { LucideIcon, ShieldCheck, UserCheck, Users, UserX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { UserDirectoryStats } from '@/types/user.types';

interface StatDef {
  key: keyof UserDirectoryStats;
  label: string;
  icon: LucideIcon;
  iconClass: string;
  caption: string;
}

const STAT_DEFS: StatDef[] = [
  {
    key: 'total',
    label: 'Total Users',
    icon: Users,
    iconClass: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    caption: 'within your access',
  },
  {
    key: 'active',
    label: 'Active Users',
    icon: UserCheck,
    iconClass:
      'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    caption: 'currently enabled',
  },
  {
    key: 'inactive',
    label: 'Inactive Users',
    icon: UserX,
    iconClass: 'bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400',
    caption: 'deactivated accounts',
  },
  {
    key: 'admins',
    label: 'Admins',
    icon: ShieldCheck,
    iconClass:
      'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
    caption: 'with elevated access',
  },
];

export function UsersStats({ stats }: { stats: UserDirectoryStats | null }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STAT_DEFS.map((stat) => {
        const Icon = stat.icon;
        const value = stats ? stats[stat.key] : 0;
        return (
          <Card key={stat.key} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {stat.label}
                </p>
                <p className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  {value}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {stat.caption}
                </p>
              </div>
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  stat.iconClass,
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
