'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  FolderKanban,
  KeyRound,
  ListChecks,
  LucideIcon,
  MoreHorizontal,
  Pencil,
  Power,
  Trash2,
  UserX,
} from 'lucide-react';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  EditUserDialog,
  UserActivityTimeline,
  UserDetailsCard,
} from '@/components/users';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import {
  clearSelectedUser,
  executeUserAction,
  optimisticUpdateUser,
  queryUsers,
} from '@/store/slices/userSlice';
import { getFullName } from '@/lib/user-utils';
import { USER_ROUTE_ROLES } from '@/lib/userPermissions';
import { ManagedUser, UserFormValues } from '@/types/user.types';

interface StatCardDef {
  key: keyof NonNullable<ManagedUser['stats']>;
  label: string;
  icon: LucideIcon;
  iconClass: string;
}

const STAT_CARDS: StatCardDef[] = [
  {
    key: 'assignedProjects',
    label: 'Assigned Projects',
    icon: FolderKanban,
    iconClass: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  },
  {
    key: 'assignedTasks',
    label: 'Assigned Tasks',
    icon: ListChecks,
    iconClass:
      'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  },
  {
    key: 'completedTasks',
    label: 'Completed Tasks',
    icon: CheckCircle2,
    iconClass:
      'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  },
  {
    key: 'upcomingMeetings',
    label: 'Upcoming Meetings',
    icon: CalendarClock,
    iconClass: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  },
];

const errorText = (e: unknown, fallback: string) =>
  typeof e === 'string' ? e : fallback;

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const permissions = useUserPermissions();
  const { selectedUser, managers, isLoadingDetail } = useAppSelector(
    (state) => state.users,
  );

  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  // Load the user (single-user mode of the query thunk) + an in-scope manager
  // list to populate the edit form. Clear on unmount.
  React.useEffect(() => {
    dispatch(queryUsers({ userId: params.id }));
    dispatch(queryUsers({ limit: 100, includeStats: false }));
    return () => {
      dispatch(clearSelectedUser());
    };
  }, [dispatch, params.id]);

  const user = selectedUser && selectedUser.id === params.id ? selectedUser : null;
  const managerOptions = React.useMemo(
    () => managers.map((m) => ({ id: m.id, label: m.name })),
    [managers],
  );

  const refetch = () => dispatch(queryUsers({ userId: params.id }));

  const handleSave = async (values: UserFormValues): Promise<boolean> => {
    if (!user) return false;
    try {
      await dispatch(
        executeUserAction({
          action: 'UPDATE_USER',
          userId: user.id,
          payload: {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            role: values.role,
            department: values.department,
            managerId: values.managerId,
            jobTitle: values.jobTitle,
            phone: values.phone,
            location: values.location,
            profileImage: values.profileImage,
          },
        }),
      ).unwrap();
      if (values.status !== user.status) {
        await dispatch(
          executeUserAction({
            action: values.status === 'ACTIVE' ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
            userId: user.id,
          }),
        ).unwrap();
      }
      toast.success('User updated', { description: `${getFullName(values)}'s details were saved.` });
      setEditOpen(false);
      refetch();
      return true;
    } catch (e) {
      toast.error('Could not update user', { description: errorText(e, 'Please try again.') });
      return false;
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
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
      toast.success(next ? 'User activated' : 'User deactivated');
      refetch();
    } catch (e) {
      toast.error('Could not update status', { description: errorText(e, 'Please try again.') });
      refetch();
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;
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

  const handleDelete = async () => {
    if (!user) return;
    setDeleteOpen(false);
    try {
      await dispatch(executeUserAction({ action: 'DELETE_USER', userId: user.id })).unwrap();
      toast.success('User deleted', { description: `${getFullName(user)} has been removed.` });
      router.push('/users');
    } catch (e) {
      toast.error('Could not delete user', { description: errorText(e, 'Please try again.') });
    }
  };

  /* ----------------------------- render ----------------------------- */

  if (isLoadingDetail && !user) {
    return (
      <RoleGuard allowedRoles={USER_ROUTE_ROLES}>
        <div className="h-full overflow-auto bg-white p-6 dark:bg-slate-900">
          <div className="mx-auto flex max-w-7xl items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>
        </div>
      </RoleGuard>
    );
  }

  if (!user) {
    return (
      <RoleGuard allowedRoles={USER_ROUTE_ROLES}>
        <div className="h-full overflow-auto bg-white p-6 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl">
            <Breadcrumbs />
            <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-card px-6 py-16 text-center ring-1 ring-foreground/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                <UserX className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  User not found
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  The user doesn’t exist or is outside your access scope.
                </p>
              </div>
              <Link href="/users">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Users
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  const canEdit = permissions.canEdit(user);
  const canReset = permissions.canResetPassword(user);
  const canToggle = permissions.canToggleStatus(user);
  const canDelete = permissions.canDelete(user);
  const hasMenu = canReset || canToggle || canDelete;

  return (
    <RoleGuard allowedRoles={USER_ROUTE_ROLES}>
      <div className="h-full overflow-auto bg-white p-6 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-4">
            <Breadcrumbs
              items={[{ label: 'Users', href: '/users' }, { label: getFullName(user) }]}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link href="/users">
                <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Users
                </Button>
              </Link>

              {(canEdit || hasMenu) && (
                <div className="flex items-center gap-2">
                  {canEdit && (
                    <Button size="sm" className="gap-1.5" onClick={() => setEditOpen(true)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                  {hasMenu && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon-sm" aria-label="More actions">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {canReset && (
                          <DropdownMenuItem onClick={handleResetPassword}>
                            <KeyRound className="h-4 w-4" />
                            Reset Password
                          </DropdownMenuItem>
                        )}
                        {canToggle && (
                          <DropdownMenuItem onClick={handleToggleStatus}>
                            <Power className="h-4 w-4" />
                            {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleteOpen(true)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <UserDetailsCard
                user={user}
                canEdit={canEdit}
                onEdit={() => setEditOpen(true)}
              />
            </div>

            <div className="space-y-6 lg:col-span-2">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {STAT_CARDS.map((card) => {
                  const Icon = card.icon;
                  const value = user.stats ? user.stats[card.key] : 0;
                  return (
                    <Card key={card.key} className="p-4">
                      <div
                        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${card.iconClass}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                        {value}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {card.label}
                      </p>
                    </Card>
                  );
                })}
              </div>

              <UserActivityTimeline activity={user.activity ?? []} />
            </div>
          </div>
        </div>
      </div>

      <EditUserDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={user}
        allUsers={user ? [user] : []}
        managerOptions={managerOptions}
        onSave={handleSave}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{' '}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {getFullName(user)}
              </span>{' '}
              and revoke their access. This action cannot be undone.
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
    </RoleGuard>
  );
}
