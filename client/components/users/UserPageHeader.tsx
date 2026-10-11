'use client';

import React from 'react';
import { Download, Plus, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/PageHeader';

interface UserPageHeaderProps {
  onCreate: () => void;
  onExport: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  canCreate?: boolean;
}

export function UserPageHeader({
  onCreate,
  onExport,
  onRefresh,
  isRefreshing = false,
  canCreate = true,
}: UserPageHeaderProps) {
  return (
    <PageHeader
      title="Users"
      description="Manage employees, roles, departments, and access permissions."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onExport}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          {canCreate && (
            <Button size="sm" className="gap-1.5" onClick={onCreate}>
              <Plus className="h-4 w-4" />
              Create User
            </Button>
          )}
        </div>
      }
    />
  );
}
