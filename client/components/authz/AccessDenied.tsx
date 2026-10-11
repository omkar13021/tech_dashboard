'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * 403 Access Denied surface. Shown inline by <PermissionRoute> when a user
 * lacks the permissions required for a page.
 */
export function AccessDenied({
  message = "You don't have permission to access this page.",
}: {
  message?: string;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          403 — Access Denied
        </p>
        <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">{message}</p>
      </div>
      <Link href="/dashboard">
        <Button variant="outline" size="sm">
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
