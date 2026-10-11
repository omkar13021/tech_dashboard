'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import {
  Eye,
  KeyRound,
  MoreHorizontal,
  Pencil,
  Power,
  Trash2,
  Users as UsersIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ManagedUser, departmentLabel } from '@/types/user.types';
import { getFullName } from '@/lib/user-utils';
import { UserPermissionState } from '@/hooks/useUserPermissions';
import { RoleBadge, StatusBadge, UserAvatar } from './user-display';

export interface UsersTableHandlers {
  onView: (user: ManagedUser) => void;
  onEdit: (user: ManagedUser) => void;
  onResetPassword: (user: ManagedUser) => void;
  onToggleStatus: (user: ManagedUser) => void;
  onDelete: (user: ManagedUser) => void;
}

interface UsersTableProps extends UsersTableHandlers {
  users: ManagedUser[];
  loading: boolean;
  hasFilters: boolean;
  onResetFilters: () => void;
  permissions: UserPermissionState;
}

function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 dark:bg-slate-800/40">
            <TableHead className="pl-4">User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12 pr-4 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  );
}

export function UsersTable({
  users,
  loading,
  hasFilters,
  onResetFilters,
  permissions,
  onView,
  onEdit,
  onResetPassword,
  onToggleStatus,
  onDelete,
}: UsersTableProps) {
  const router = useRouter();

  if (loading) {
    return (
      <TableShell>
        {Array.from({ length: 6 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell className="pl-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="space-y-1.5">
                  <div className="h-3 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-2.5 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            </TableCell>
            {Array.from({ length: 6 }).map((__, j) => (
              <TableCell key={j}>
                <div className="h-3 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableShell>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-card px-6 py-16 text-center ring-1 ring-foreground/10">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
          <UsersIcon className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            No users found
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {hasFilters
              ? 'No users match your current filters.'
              : 'There are no users to display yet.'}
          </p>
        </div>
        {hasFilters && (
          <Button variant="outline" size="sm" onClick={onResetFilters}>
            Reset filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <TableShell>
      {users.map((user) => {
        const canEdit = permissions.canEdit(user);
        const canReset = permissions.canResetPassword(user);
        const canToggle = permissions.canToggleStatus(user);
        const canDelete = permissions.canDelete(user);
        return (
          <TableRow
            key={user.id}
            className="cursor-pointer"
            onClick={() => router.push(`/users/${user.id}`)}
          >
            <TableCell className="pl-4">
              <div className="flex items-center gap-3">
                <UserAvatar user={user} />
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                    {getFullName(user)}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {user.email}
                  </p>
                </div>
              </div>
            </TableCell>

            <TableCell>
              <RoleBadge role={user.role} />
            </TableCell>

            <TableCell className="text-slate-700 dark:text-slate-300">
              {departmentLabel(user.department)}
            </TableCell>

            <TableCell className="text-slate-700 dark:text-slate-300">
              {user.managerName ?? <span className="text-slate-400">—</span>}
            </TableCell>

            <TableCell>
              <StatusBadge status={user.status} />
            </TableCell>

            <TableCell className="text-slate-500 dark:text-slate-400">
              {format(parseISO(user.createdAt), 'MMM d, yyyy')}
            </TableCell>

            {/* Actions — stop propagation so the row click doesn't fire */}
            <TableCell
              className="pr-4 text-right"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions for ${getFullName(user)}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onView(user)}>
                    <Eye className="h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  {canEdit && (
                    <DropdownMenuItem onClick={() => onEdit(user)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {canReset && (
                    <DropdownMenuItem onClick={() => onResetPassword(user)}>
                      <KeyRound className="h-4 w-4" />
                      Reset Password
                    </DropdownMenuItem>
                  )}
                  {canToggle && (
                    <DropdownMenuItem onClick={() => onToggleStatus(user)}>
                      <Power className="h-4 w-4" />
                      {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDelete(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        );
      })}
    </TableShell>
  );
}
