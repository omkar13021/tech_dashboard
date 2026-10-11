'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import {
  KeyRound,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  Search,
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
import {
  AssistantFormDialog,
  AssistantFormValues,
} from '@/components/assistants/AssistantFormDialog';
import { StatusBadge, UserAvatar } from '@/components/users/user-display';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAuthz } from '@/hooks/useAuthz';
import {
  queryAssistants,
  executeAssistantAction,
} from '@/store/slices/assistantSlice';
import { fetchPermissionCatalog } from '@/store/slices/roleSlice';
import { AssistantListItem } from '@/services/assistant.service';
import { getApiErrorMessage } from '@/lib/apiError';
import { getFullName } from '@/lib/user-utils';

const PAGE_SIZE = 20;

function AssistantsPageInner() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { has } = useAuthz();
  const { assistants, meta, isLoading } = useAppSelector((s) => s.assistants);
  const catalog = useAppSelector((s) => s.roles.catalog);

  const [search, setSearch] = React.useState('');
  const [debounced, setDebounced] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<AssistantListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AssistantListItem | null>(null);

  const canCreate = has('assistant.create');
  const canEdit = has('assistant.edit');
  const canDelete = has('assistant.delete');

  React.useEffect(() => {
    dispatch(fetchPermissionCatalog());
  }, [dispatch]);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadAssistants = React.useCallback(() => {
    return dispatch(queryAssistants({ search: debounced || undefined, page, limit: PAGE_SIZE }));
  }, [dispatch, debounced, page]);

  React.useEffect(() => {
    loadAssistants();
  }, [loadAssistants]);

  const handleCreate = async (values: AssistantFormValues): Promise<boolean> => {
    try {
      await dispatch(
        executeAssistantAction({
          action: 'CREATE',
          payload: {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            password: values.password,
            jobTitle: values.jobTitle,
            permissionKeys: values.permissionKeys,
          },
        }),
      ).unwrap();
      toast.success('Assistant created');
      setCreateOpen(false);
      loadAssistants();
      return true;
    } catch (e) {
      toast.error('Could not create assistant', { description: getApiErrorMessage(e, '') });
      return false;
    }
  };

  const handleEdit = async (values: AssistantFormValues): Promise<boolean> => {
    if (!editTarget) return false;
    try {
      await dispatch(
        executeAssistantAction({
          action: 'UPDATE',
          assistantId: editTarget.id,
          payload: {
            firstName: values.firstName,
            lastName: values.lastName,
            jobTitle: values.jobTitle,
          },
        }),
      ).unwrap();
      toast.success('Assistant updated');
      setEditTarget(null);
      loadAssistants();
      return true;
    } catch (e) {
      toast.error('Could not update assistant', { description: getApiErrorMessage(e, '') });
      return false;
    }
  };

  const handleToggle = async (a: AssistantListItem) => {
    try {
      await dispatch(
        executeAssistantAction({
          action: a.isActive ? 'DEACTIVATE' : 'ACTIVATE',
          assistantId: a.id,
        }),
      ).unwrap();
      toast.success(a.isActive ? 'Assistant deactivated' : 'Assistant activated');
      loadAssistants();
    } catch (e) {
      toast.error('Could not update status', { description: getApiErrorMessage(e, '') });
    }
  };

  const handleReset = async (a: AssistantListItem) => {
    try {
      const res = await dispatch(
        executeAssistantAction({ action: 'RESET_PASSWORD', assistantId: a.id }),
      ).unwrap();
      const temp = (res.data as { tempPassword?: string } | undefined)?.tempPassword;
      toast.success('Password reset', {
        description: temp ? `Temporary password: ${temp}` : `Sent to ${a.email}`,
      });
    } catch (e) {
      toast.error('Could not reset password', { description: getApiErrorMessage(e, '') });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await dispatch(executeAssistantAction({ action: 'DELETE', assistantId: target.id })).unwrap();
      toast.success('Assistant deleted');
      loadAssistants();
    } catch (e) {
      toast.error('Could not delete assistant', { description: getApiErrorMessage(e, '') });
    }
  };

  return (
    <div className="h-full overflow-auto bg-white p-6 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          title="Assistants"
          description="Delegate access to assistants. Their permissions are always a subset of yours."
          actions={
            canCreate ? (
              <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Create Assistant
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
            placeholder="Search assistants"
            className="h-9 pl-9"
          />
        </div>

        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 dark:bg-slate-800/40">
                <TableHead className="pl-4">Assistant</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-12 pr-4 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoading && assistants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-400">
                    No assistants yet.
                  </TableCell>
                </TableRow>
              )}
              {assistants.map((a) => (
                <TableRow
                  key={a.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/assistants/${a.id}`)}
                >
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={a} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                          {getFullName(a)}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {a.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {a.grantedPermissionCount} granted
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={a.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {a.lastActiveAt ? format(parseISO(a.lastActiveAt), 'MMM d, yyyy') : 'Never'}
                  </TableCell>
                  <TableCell className="pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                    {(canEdit || canDelete) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label="Assistant actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {canEdit && (
                            <DropdownMenuItem onClick={() => setEditTarget(a)}>
                              <Pencil className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                          )}
                          {canEdit && (
                            <DropdownMenuItem onClick={() => handleReset(a)}>
                              <KeyRound className="h-4 w-4" /> Reset Password
                            </DropdownMenuItem>
                          )}
                          {canEdit && (
                            <DropdownMenuItem onClick={() => handleToggle(a)}>
                              <Power className="h-4 w-4" />
                              {a.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(a)}>
                                <Trash2 className="h-4 w-4" /> Delete
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
              Page {meta.page} of {meta.totalPages} · {meta.total} assistants
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
        <AssistantFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          mode="create"
          catalog={catalog}
          onSubmit={handleCreate}
        />
      )}

      <AssistantFormDialog
        open={editTarget !== null}
        onOpenChange={(o) => !o && setEditTarget(null)}
        mode="edit"
        assistant={editTarget}
        catalog={catalog}
        onSubmit={handleEdit}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete assistant?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes{' '}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {deleteTarget ? getFullName(deleteTarget) : ''}
              </span>{' '}
              and revokes their access.
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

export default function AssistantsPage() {
  return (
    <PermissionRoute permission="assistant.view">
      <AssistantsPageInner />
    </PermissionRoute>
  );
}
