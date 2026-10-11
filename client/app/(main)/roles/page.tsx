'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import {
  Copy,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  Search,
  Shield,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { PermissionRoute } from '@/components/authz/PermissionRoute';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { RoleFormDialog, RoleFormValues } from '@/components/roles/RoleFormDialog';
import { StatusBadge } from '@/components/users/user-display';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAuthz } from '@/hooks/useAuthz';
import {
  queryRoles,
  executeRoleAction,
  fetchPermissionCatalog,
  clearSelectedRole,
} from '@/store/slices/roleSlice';
import { refreshPermissions } from '@/store/slices/authSlice';
import { RoleListItem } from '@/services/role.service';
import { getApiErrorMessage } from '@/lib/apiError';

const PAGE_SIZE = 20;

function RolesPageInner() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { has } = useAuthz();
  const { roles, meta, catalog, selectedRole, isLoading } = useAppSelector((s) => s.roles);

  const [search, setSearch] = React.useState('');
  const [debounced, setDebounced] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<RoleListItem | null>(null);

  const canCreate = has('role.create');
  const canEdit = has('role.edit');
  const canDelete = has('role.delete');

  React.useEffect(() => {
    dispatch(fetchPermissionCatalog());
  }, [dispatch]);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadRoles = React.useCallback(() => {
    return dispatch(
      queryRoles({ search: debounced || undefined, page, limit: PAGE_SIZE, sortBy: 'name', sortOrder: 'asc' }),
    );
  }, [dispatch, debounced, page]);

  React.useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const afterMutation = async () => {
    await loadRoles();
    dispatch(refreshPermissions()); // role/permission edits may affect the actor
  };

  const handleCreate = async (values: RoleFormValues): Promise<boolean> => {
    try {
      await dispatch(
        executeRoleAction({
          action: 'CREATE',
          payload: {
            name: values.name,
            description: values.description,
            permissionKeys: values.permissionKeys,
          },
        }),
      ).unwrap();
      toast.success('Role created');
      setCreateOpen(false);
      afterMutation();
      return true;
    } catch (e) {
      toast.error('Could not create role', { description: getApiErrorMessage(e, '') });
      return false;
    }
  };

  const openEdit = async (role: RoleListItem) => {
    try {
      await dispatch(queryRoles({ roleId: role.id, includeUsers: false })).unwrap();
      setEditOpen(true);
    } catch (e) {
      toast.error('Could not load role', { description: getApiErrorMessage(e, '') });
    }
  };

  const handleEdit = async (values: RoleFormValues): Promise<boolean> => {
    if (!selectedRole) return false;
    try {
      // Update name/description, then sync permissions.
      await dispatch(
        executeRoleAction({
          action: 'UPDATE',
          roleId: selectedRole.id,
          payload: { name: values.name, description: values.description },
        }),
      ).unwrap();
      await dispatch(
        executeRoleAction({
          action: 'ASSIGN_PERMISSIONS',
          roleId: selectedRole.id,
          payload: { permissionKeys: values.permissionKeys },
        }),
      ).unwrap();
      toast.success('Role updated');
      setEditOpen(false);
      dispatch(clearSelectedRole());
      afterMutation();
      return true;
    } catch (e) {
      toast.error('Could not update role', { description: getApiErrorMessage(e, '') });
      return false;
    }
  };

  const handleClone = async (role: RoleListItem) => {
    try {
      await dispatch(executeRoleAction({ action: 'CLONE', roleId: role.id, payload: {} })).unwrap();
      toast.success('Role cloned');
      afterMutation();
    } catch (e) {
      toast.error('Could not clone role', { description: getApiErrorMessage(e, '') });
    }
  };

  const handleToggle = async (role: RoleListItem) => {
    try {
      await dispatch(
        executeRoleAction({ action: role.isActive ? 'DEACTIVATE' : 'ACTIVATE', roleId: role.id }),
      ).unwrap();
      toast.success(role.isActive ? 'Role deactivated' : 'Role activated');
      afterMutation();
    } catch (e) {
      toast.error('Could not update role', { description: getApiErrorMessage(e, '') });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await dispatch(executeRoleAction({ action: 'DELETE', roleId: target.id })).unwrap();
      toast.success('Role deleted');
      afterMutation();
    } catch (e) {
      toast.error('Could not delete role', { description: getApiErrorMessage(e, '') });
    }
  };

  return (
    <div className="h-full overflow-auto bg-white p-6 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          title="Roles & Permissions"
          description="Create roles and assign dynamic permissions across all modules."
          actions={
            canCreate ? (
              <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Create Role
              </Button>
            ) : undefined
          }
        />

        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search roles"
            className="h-9 pl-9"
          />
        </div>

        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 dark:bg-slate-800/40">
                <TableHead className="pl-4">Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-12 pr-4 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-400">
                    Loading roles…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-400">
                    No roles found.
                  </TableCell>
                </TableRow>
              )}
              {roles.map((role) => (
                <TableRow
                  key={role.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/roles/${role.id}`)}
                >
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        <Shield className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                            {role.name}
                          </p>
                          {role.isSystem && (
                            <Badge variant="secondary" className="text-[10px]">
                              System
                            </Badge>
                          )}
                        </div>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {role.description || '—'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">
                    {role.permissionCount}
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">
                    {role.userCount}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={role.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {format(parseISO(role.updatedAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                    {(canEdit || canDelete) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label="Role actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {canEdit && (
                            <DropdownMenuItem onClick={() => openEdit(role)}>
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {canCreate && (
                            <DropdownMenuItem onClick={() => handleClone(role)}>
                              <Copy className="h-4 w-4" />
                              Clone
                            </DropdownMenuItem>
                          )}
                          {canEdit && !role.isSystem && (
                            <DropdownMenuItem onClick={() => handleToggle(role)}>
                              <Power className="h-4 w-4" />
                              {role.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                          )}
                          {canDelete && !role.isSystem && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(role)}>
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Page {meta.page} of {meta.totalPages} · {meta.total} roles
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {canCreate && (
        <RoleFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          mode="create"
          catalog={catalog}
          onSubmit={handleCreate}
        />
      )}

      <RoleFormDialog
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o);
          if (!o) dispatch(clearSelectedRole());
        }}
        mode="edit"
        role={selectedRole}
        catalog={catalog}
        onSubmit={handleEdit}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes{' '}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {deleteTarget?.name}
              </span>
              . Roles with assigned users cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function RolesPage() {
  return (
    <PermissionRoute permission="role.view">
      <RolesPageInner />
    </PermissionRoute>
  );
}
