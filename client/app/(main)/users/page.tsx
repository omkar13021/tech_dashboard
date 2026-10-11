'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ALL,
  CreateUserDialog,
  DEFAULT_FILTERS,
  EditUserDialog,
  UserFilterState,
  UserPageHeader,
  UsersFilters,
  UsersStats,
  UsersTable,
} from '@/components/users';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import {
  executeUserAction,
  optimisticRemoveUser,
  optimisticUpdateUser,
  queryUsers,
} from '@/store/slices/userSlice';
import { UserQueryParams } from '@/services/user.service';
import { ManagedUser, ROLE_META, UserFormValues, departmentLabel } from '@/types/user.types';
import { getFullName } from '@/lib/user-utils';
import { USER_ROUTE_ROLES } from '@/lib/userPermissions';

const PAGE_SIZE = 20;

function toActionPayload(v: UserFormValues, includePassword: boolean) {
  return {
    firstName: v.firstName,
    lastName: v.lastName,
    email: v.email,
    role: v.role,
    department: v.department,
    managerId: v.managerId,
    jobTitle: v.jobTitle,
    phone: v.phone,
    location: v.location,
    profileImage: v.profileImage,
    ...(includePassword ? { password: v.password, isActive: v.status === 'ACTIVE' } : {}),
  };
}

function exportUsersToCsv(users: ManagedUser[]) {
  const headers = ['Name', 'Email', 'Role', 'Department', 'Manager', 'Status', 'Created'];
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = users.map((u) =>
    [
      getFullName(u),
      u.email,
      ROLE_META[u.role].label,
      departmentLabel(u.department),
      u.managerName ?? '',
      u.status === 'ACTIVE' ? 'Active' : 'Inactive',
      format(parseISO(u.createdAt), 'yyyy-MM-dd'),
    ]
      .map(escape)
      .join(','),
  );
  const csv = [headers.map(escape).join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'users.csv';
  link.click();
  URL.revokeObjectURL(url);
}

const errorText = (e: unknown, fallback: string) =>
  typeof e === 'string' ? e : fallback;

export default function UsersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const permissions = useUserPermissions();
  const { users, meta, stats, managers, isLoading } = useAppSelector(
    (state) => state.users,
  );

  const [filters, setFilters] = React.useState<UserFilterState>(DEFAULT_FILTERS);
  const [page, setPage] = React.useState(1);
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<ManagedUser | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<ManagedUser | null>(null);

  // Debounce the free-text search so we don't query on every keystroke.
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search.trim()), 350);
    return () => clearTimeout(t);
  }, [filters.search]);

  // Changing any filter resets to page 1 (handled here rather than in an effect).
  const handleFiltersChange = React.useCallback((next: UserFilterState) => {
    setFilters(next);
    setPage(1);
  }, []);

  const buildParams = React.useCallback(
    (): UserQueryParams => ({
      search: debouncedSearch || undefined,
      role: filters.role !== ALL ? [filters.role] : undefined,
      department: filters.department !== ALL ? filters.department : undefined,
      isActive: filters.status !== ALL ? filters.status === 'ACTIVE' : undefined,
      page,
      limit: PAGE_SIZE,
      includeStats: true,
    }),
    [debouncedSearch, filters.role, filters.department, filters.status, page],
  );

  const loadUsers = React.useCallback(() => {
    return dispatch(queryUsers(buildParams()));
  }, [dispatch, buildParams]);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const hasFilters =
    filters.search !== '' ||
    filters.role !== ALL ||
    filters.department !== ALL ||
    filters.status !== ALL;

  const managerOptions = React.useMemo(
    () => managers.map((m) => ({ id: m.id, label: m.name })),
    [managers],
  );

  /* --------------------------- mutations --------------------------- */

  const handleCreate = async (values: UserFormValues): Promise<boolean> => {
    try {
      await dispatch(
        executeUserAction({
          action: 'CREATE_USER',
          payload: toActionPayload(values, true),
        }),
      ).unwrap();
      toast.success('User created', { description: `${getFullName(values)} has been added.` });
      setCreateOpen(false);
      loadUsers();
      return true;
    } catch (e) {
      toast.error('Could not create user', { description: errorText(e, 'Please try again.') });
      return false;
    }
  };

  const handleSaveEdit = async (values: UserFormValues): Promise<boolean> => {
    if (!editTarget) return false;
    try {
      await dispatch(
        executeUserAction({
          action: 'UPDATE_USER',
          userId: editTarget.id,
          payload: toActionPayload(values, false),
        }),
      ).unwrap();
      // Status is changed through the dedicated activate/deactivate actions.
      if (values.status !== editTarget.status) {
        await dispatch(
          executeUserAction({
            action: values.status === 'ACTIVE' ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
            userId: editTarget.id,
          }),
        ).unwrap();
      }
      toast.success('User updated', { description: `${getFullName(values)}'s details were saved.` });
      setEditTarget(null);
      loadUsers();
      return true;
    } catch (e) {
      toast.error('Could not update user', { description: errorText(e, 'Please try again.') });
      return false;
    }
  };

  const handleToggleStatus = async (user: ManagedUser) => {
    const next = !user.isActive;
    dispatch(
      optimisticUpdateUser({
        id: user.id,
        changes: { isActive: next, status: next ? 'ACTIVE' : 'INACTIVE' },
      }),
    );
    try {
      await dispatch(
        executeUserAction({
          action: next ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
          userId: user.id,
        }),
      ).unwrap();
      toast.success(next ? 'User activated' : 'User deactivated', {
        description: `${getFullName(user)} is now ${next ? 'active' : 'inactive'}.`,
      });
      loadUsers();
    } catch (e) {
      toast.error('Could not update status', { description: errorText(e, 'Please try again.') });
      loadUsers(); // resync after a failed optimistic update
    }
  };

  const handleResetPassword = async (user: ManagedUser) => {
    try {
      const res = await dispatch(
        executeUserAction({ action: 'RESET_PASSWORD', userId: user.id }),
      ).unwrap();
      const temp = (res.data as { tempPassword?: string } | undefined)?.tempPassword;
      toast.success('Password reset', {
        description: temp
          ? `Temporary password: ${temp}`
          : `A reset link was sent to ${user.email}.`,
      });
    } catch (e) {
      toast.error('Could not reset password', { description: errorText(e, 'Please try again.') });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    dispatch(optimisticRemoveUser(target.id));
    try {
      await dispatch(executeUserAction({ action: 'DELETE_USER', userId: target.id })).unwrap();
      toast.success('User deleted', { description: `${getFullName(target)} has been removed.` });
      loadUsers();
    } catch (e) {
      toast.error('Could not delete user', { description: errorText(e, 'Please try again.') });
      loadUsers();
    }
  };

  const handleExport = () => {
    if (users.length === 0) {
      toast.error('Nothing to export', { description: 'No users on this page.' });
      return;
    }
    exportUsersToCsv(users);
    toast.success('Export started', { description: `${users.length} users exported to CSV.` });
  };

  return (
    <RoleGuard allowedRoles={USER_ROUTE_ROLES}>
      <div className="h-full overflow-auto bg-white p-6 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl space-y-6">
          <UserPageHeader
            canCreate={permissions.canCreate}
            onCreate={() => setCreateOpen(true)}
            onExport={handleExport}
            onRefresh={loadUsers}
            isRefreshing={isLoading}
          />

          <UsersStats stats={stats} />

          <UsersFilters
            filters={filters}
            onChange={handleFiltersChange}
            resultCount={meta.total}
            totalCount={stats?.total ?? meta.total}
          />

          <UsersTable
            users={users}
            loading={isLoading}
            hasFilters={hasFilters}
            onResetFilters={() => handleFiltersChange(DEFAULT_FILTERS)}
            permissions={permissions}
            onView={(user) => router.push(`/users/${user.id}`)}
            onEdit={(user) => setEditTarget(user)}
            onResetPassword={handleResetPassword}
            onToggleStatus={handleToggleStatus}
            onDelete={(user) => setDeleteTarget(user)}
          />

          {/* Server-side pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Page {meta.page} of {meta.totalPages} · {meta.total} users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={page >= meta.totalPages || isLoading}
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {permissions.canCreate && (
        <CreateUserDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          allUsers={users}
          managerOptions={managerOptions}
          onCreate={handleCreate}
        />
      )}

      <EditUserDialog
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
        user={editTarget}
        allUsers={users}
        managerOptions={managerOptions}
        onSave={handleSaveEdit}
      />

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{' '}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {deleteTarget ? getFullName(deleteTarget) : ''}
              </span>{' '}
              and revoke their access. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </RoleGuard>
  );
}
