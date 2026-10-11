'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DEPARTMENT_OPTIONS,
  Department,
  ROLE_OPTIONS,
  STATUS_OPTIONS,
  UserStatus,
} from '@/types/user.types';
import { UserRole } from '@/types/auth.types';

export const ALL = 'ALL' as const;

export type RoleFilter = UserRole | typeof ALL;
export type DepartmentFilter = Department | typeof ALL;
export type StatusFilter = UserStatus | typeof ALL;

export interface UserFilterState {
  search: string;
  role: RoleFilter;
  department: DepartmentFilter;
  status: StatusFilter;
}

export const DEFAULT_FILTERS: UserFilterState = {
  search: '',
  role: ALL,
  department: ALL,
  status: ALL,
};

interface UsersFiltersProps {
  filters: UserFilterState;
  onChange: (next: UserFilterState) => void;
  /** Count of users matching the current filters, for the toolbar caption. */
  resultCount: number;
  totalCount: number;
}

export function UsersFilters({
  filters,
  onChange,
  resultCount,
  totalCount,
}: UsersFiltersProps) {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.role !== ALL ||
    filters.department !== ALL ||
    filters.status !== ALL;

  const update = (patch: Partial<UserFilterState>) =>
    onChange({ ...filters, ...patch });

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Search by name or email"
            className="h-9 pl-9"
            aria-label="Search users"
          />
        </div>

        {/* Filter selects */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.role}
            onValueChange={(value) => update({ role: value as RoleFilter })}
          >
            <SelectTrigger className="h-9 w-[150px]" aria-label="Filter by role">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All roles</SelectItem>
              {ROLE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.department}
            onValueChange={(value) =>
              update({ department: value as DepartmentFilter })
            }
          >
            <SelectTrigger
              className="h-9 w-[160px]"
              aria-label="Filter by department"
            >
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All departments</SelectItem>
              {DEPARTMENT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(value) => update({ status: value as StatusFilter })}
          >
            <SelectTrigger className="h-9 w-[140px]" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-slate-500"
            onClick={() => onChange(DEFAULT_FILTERS)}
            disabled={!hasActiveFilters}
          >
            <X className="h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Showing <span className="font-medium text-slate-700 dark:text-slate-300">{resultCount}</span>{' '}
        of {totalCount} users
      </p>
    </div>
  );
}
