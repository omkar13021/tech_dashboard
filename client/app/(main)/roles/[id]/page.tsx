'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { ArrowLeft, Pencil, Shield, Users as UsersIcon } from 'lucide-react';
import { PermissionRoute } from '@/components/authz/PermissionRoute';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RoleFormDialog, RoleFormValues } from '@/components/roles/RoleFormDialog';
import { StatusBadge, UserAvatar } from '@/components/users/user-display';
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
import { getApiErrorMessage } from '@/lib/apiError';
import { getFullName } from '@/lib/user-utils';

function RoleDetailInner() {
  const params = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { has } = useAuthz();
  const { selectedRole, catalog, isLoadingDetail } = useAppSelector((s) => s.roles);
  const [editOpen, setEditOpen] = React.useState(false);

  const role = selectedRole && selectedRole.id === params.id ? selectedRole : null;
  const canEdit = has('role.edit');

  React.useEffect(() => {
    dispatch(queryRoles({ roleId: params.id, includeUsers: true }));
    dispatch(fetchPermissionCatalog());
    return () => {
      dispatch(clearSelectedRole());
    };
  }, [dispatch, params.id]);

  const permsByModule = React.useMemo(() => {
    const map = new Map<string, string[]>();
    role?.permissions.forEach((p) => {
      if (!map.has(p.module)) map.set(p.module, []);
      map.get(p.module)!.push(p.label);
    });
    return [...map.entries()];
  }, [role]);

  const handleEdit = async (values: RoleFormValues): Promise<boolean> => {
    if (!role) return false;
    try {
      await dispatch(
        executeRoleAction({
          action: 'UPDATE',
          roleId: role.id,
          payload: { name: values.name, description: values.description },
        }),
      ).unwrap();
      await dispatch(
        executeRoleAction({
          action: 'ASSIGN_PERMISSIONS',
          roleId: role.id,
          payload: { permissionKeys: values.permissionKeys },
        }),
      ).unwrap();
      toast.success('Role updated');
      setEditOpen(false);
      dispatch(queryRoles({ roleId: role.id, includeUsers: true }));
      dispatch(refreshPermissions());
      return true;
    } catch (e) {
      toast.error('Could not update role', { description: getApiErrorMessage(e, '') });
      return false;
    }
  };

  if (isLoadingDetail && !role) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <Breadcrumbs />
        <p className="mt-10 text-center text-sm text-slate-500">Role not found.</p>
        <div className="mt-4 text-center">
          <Link href="/roles">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to Roles
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-white p-6 dark:bg-slate-900">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-4">
          <Breadcrumbs items={[{ label: 'Roles', href: '/roles' }, { label: role.name }]} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/roles">
              <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600">
                <ArrowLeft className="h-4 w-4" /> Back to Roles
              </Button>
            </Link>
            {canEdit && (
              <Button size="sm" className="gap-1.5" onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4" /> Edit Role
              </Button>
            )}
          </div>
        </div>

        <Card className="p-0">
          <div className="flex items-start gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Shield className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {role.name}
                </h2>
                {role.isSystem && <Badge variant="secondary">System</Badge>}
                <StatusBadge status={role.isActive ? 'ACTIVE' : 'INACTIVE'} />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {role.description || 'No description'}
              </p>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
                <span>{role.permissionKeys.length} permissions</span>
                <span>{role.userCount} users</span>
                <span>Created {format(parseISO(role.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {permsByModule.length === 0 && (
                <p className="text-sm text-slate-400">No permissions assigned.</p>
              )}
              {permsByModule.map(([module, labels]) => (
                <div key={module}>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {module}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {labels.map((l) => (
                      <Badge key={l} variant="secondary" className="font-normal">
                        {l}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UsersIcon className="h-4 w-4 text-slate-400" />
                Assigned Users ({role.users?.length ?? role.userCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!role.users || role.users.length === 0 ? (
                <p className="text-sm text-slate-400">No users assigned.</p>
              ) : (
                <div className="space-y-1">
                  {role.users.map((u, i) => (
                    <div key={u.id}>
                      {i > 0 && <Separator className="my-1" />}
                      <Link
                        href={`/users/${u.id}`}
                        className="flex items-center gap-3 rounded-md p-1.5 hover:bg-muted"
                      >
                        <UserAvatar user={u} className="h-8 w-8" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                            {getFullName(u)}
                          </p>
                          <p className="truncate text-xs text-slate-400">{u.email}</p>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <RoleFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        role={role}
        catalog={catalog}
        onSubmit={handleEdit}
      />
    </div>
  );
}

export default function RoleDetailPage() {
  return (
    <PermissionRoute permission="role.view">
      <RoleDetailInner />
    </PermissionRoute>
  );
}
