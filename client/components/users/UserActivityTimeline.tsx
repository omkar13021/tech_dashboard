'use client';

import React from 'react';
import { format, parseISO } from 'date-fns';
import {
  ArrowLeftRight,
  Building2,
  KeyRound,
  LucideIcon,
  Power,
  Trash2,
  UserCog,
  UserPen,
  UserPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserActivityEntry, UserActivityType } from '@/types/user.types';

const ICONS: Record<UserActivityType, LucideIcon> = {
  CREATE_USER: UserPlus,
  UPDATE_USER: UserPen,
  DELETE_USER: Trash2,
  ACTIVATE_USER: Power,
  DEACTIVATE_USER: Power,
  RESET_PASSWORD: KeyRound,
  ROLE_CHANGE: UserCog,
  DEPARTMENT_CHANGE: Building2,
  MANAGER_CHANGE: ArrowLeftRight,
};

const ICON_TINTS: Record<UserActivityType, string> = {
  CREATE_USER: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  UPDATE_USER: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  DELETE_USER: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  ACTIVATE_USER:
    'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  DEACTIVATE_USER:
    'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  RESET_PASSWORD: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  ROLE_CHANGE:
    'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  DEPARTMENT_CHANGE:
    'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
  MANAGER_CHANGE:
    'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
};

export function UserActivityTimeline({
  activity,
}: {
  activity: UserActivityEntry[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            No activity recorded yet.
          </p>
        ) : (
          <ol className="relative space-y-5">
            {activity.map((entry, index) => {
              const Icon = ICONS[entry.type] ?? UserPen;
              const isLast = index === activity.length - 1;
              return (
                <li key={entry.id} className="relative flex gap-3">
                  {!isLast && (
                    <span
                      className="absolute left-[15px] top-8 h-[calc(100%+0.25rem)] w-px bg-border"
                      aria-hidden
                    />
                  )}
                  <span
                    className={cn(
                      'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      ICON_TINTS[entry.type] ?? 'bg-slate-100 text-slate-500',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1 pb-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {entry.title}
                      </p>
                      <time className="text-xs text-slate-400">
                        {format(parseISO(entry.timestamp), 'MMM d, yyyy · h:mm a')}
                      </time>
                    </div>
                    {entry.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {entry.description}
                      </p>
                    )}
                    {entry.actor && (
                      <p className="mt-0.5 text-xs text-slate-400">by {entry.actor}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
