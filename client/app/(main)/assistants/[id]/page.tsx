'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { ArrowLeft, Clock, LogIn, Monitor, Save, ShieldCheck } from 'lucide-react';
import { PermissionRoute } from '@/components/authz/PermissionRoute';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { PermissionMatrix } from '@/components/authz/PermissionMatrix';
import { StatusBadge, UserAvatar } from '@/components/users/user-display';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAuthz } from '@/hooks/useAuthz';
import {
  queryAssistants,
  executeAssistantAction,
  clearSelectedAssistant,
} from '@/store/slices/assistantSlice';
import { fetchPermissionCatalog } from '@/store/slices/roleSlice';
import { getApiErrorMessage } from '@/lib/apiError';
import { getFullName } from '@/lib/user-utils';

function AssistantDetailInner() {
  const params = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { has } = useAuthz();
  const { selectedAssistant, isLoadingDetail } = useAppSelector((s) => s.assistants);
  const catalog = useAppSelector((s) => s.roles.catalog);

  const detail = selectedAssistant && selectedAssistant.data.id === params.id ? selectedAssistant : null;
  const canAssign = has('assistant.assign');

  const [draft, setDraft] = React.useState<string[]>([]);
  const [seedSig, setSeedSig] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const refetch = React.useCallback(
    () => dispatch(queryAssistants({ assistantId: params.id })),
    [dispatch, params.id],
  );

  React.useEffect(() => {
    refetch();
    dispatch(fetchPermissionCatalog());
    return () => {
      dispatch(clearSelectedAssistant());
    };
  }, [dispatch, params.id, refetch]);

  // Seed the permission draft from the loaded grants (and re-seed after a save),
  // using the render-phase "adjust state" pattern (no setState-in-effect).
  const grantedSig = detail ? [...detail.grantedPermissions].sort().join(',') : null;
  if (detail && seedSig !== grantedSig) {
    setSeedSig(grantedSig);
    setDraft(detail.grantedPermissions);
  }

  const dirty = React.useMemo(() => {
    if (!detail) return false;
    const a = new Set(detail.grantedPermissions);
    const b = new Set(draft);
    if (a.size !== b.size) return true;
    return [...a].some((k) => !b.has(k));
  }, [detail, draft]);

  const handleSavePermissions = async () => {
    if (!detail) return;
    const original = new Set(detail.grantedPermissions);
    const current = new Set(draft);
    const added = [...current].filter((k) => !original.has(k));
    const removed = [...original].filter((k) => !current.has(k));
    setSaving(true);
    try {
      if (added.length) {
        await dispatch(
          executeAssistantAction({
            action: 'GRANT_PERMISSIONS',
            assistantId: detail.data.id,
            payload: { permissionKeys: added },
          }),
        ).unwrap();
      }
      if (removed.length) {
        await dispatch(
          executeAssistantAction({
            action: 'REVOKE_PERMISSIONS',
            assistantId: detail.data.id,
            payload: { permissionKeys: removed },
          }),
        ).unwrap();
      }
      toast.success('Permissions updated');
      refetch();
    } catch (e) {
      toast.error('Could not update permissions', { description: getApiErrorMessage(e, '') });
    } finally {
      setSaving(false);
    }
  };

  if (isLoadingDetail && !detail) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <Breadcrumbs />
        <p className="mt-10 text-center text-sm text-slate-500">Assistant not found.</p>
        <div className="mt-4 text-center">
          <Link href="/assistants">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const a = detail.data;

  return (
    <div className="h-full overflow-auto bg-white p-6 dark:bg-slate-900">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-4">
          <Breadcrumbs items={[{ label: 'Assistants', href: '/assistants' }, { label: getFullName(a) }]} />
          <Link href="/assistants">
            <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600">
              <ArrowLeft className="h-4 w-4" /> Back to Assistants
            </Button>
          </Link>
        </div>

        {/* Identity */}
        <Card className="p-0">
          <div className="flex flex-wrap items-center gap-4 p-6">
            <UserAvatar user={a} className="h-14 w-14 text-base" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {getFullName(a)}
                </h2>
                <StatusBadge status={a.isActive ? 'ACTIVE' : 'INACTIVE'} />
                <Badge variant="secondary">Assistant</Badge>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{a.email}</p>
              {a.principal && (
                <p className="mt-0.5 text-xs text-slate-400">
                  Delegated by {a.principal.firstName} {a.principal.lastName}
                </p>
              )}
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>Last active</p>
              <p className="font-medium text-slate-600 dark:text-slate-300">
                {a.lastActiveAt ? format(parseISO(a.lastActiveAt), 'MMM d, yyyy · h:mm a') : 'Never'}
              </p>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="permissions">
          <TabsList>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="logins">Login History</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Permissions */}
          <TabsContent value="permissions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                    Delegated Permissions
                  </CardTitle>
                  <p className="mt-1 text-xs text-slate-500">
                    Bounded by the principal&apos;s permissions. Locked items are not available to grant.
                  </p>
                </div>
                {canAssign && (
                  <Button size="sm" className="gap-1.5" disabled={!dirty || saving} onClick={handleSavePermissions}>
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <PermissionMatrix
                  catalog={catalog}
                  selected={draft}
                  allowedKeys={detail.principalPermissions}
                  onChange={setDraft}
                  disabled={!canAssign}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Login history */}
          <TabsContent value="logins">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <LogIn className="h-4 w-4 text-slate-400" /> Login History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!detail.loginHistory || detail.loginHistory.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-400">No login activity yet.</p>
                ) : (
                  <div className="space-y-1">
                    {detail.loginHistory.map((e, i) => (
                      <div key={e.id}>
                        {i > 0 && <Separator className="my-1" />}
                        <div className="flex items-center justify-between gap-3 py-1.5">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={e.type === 'FAILED' ? 'destructive' : 'secondary'}
                              className="font-normal"
                            >
                              {e.type}
                            </Badge>
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <Monitor className="h-3 w-3" />
                              {e.ipAddress || 'unknown IP'}
                            </span>
                          </div>
                          <time className="text-xs text-slate-400">
                            {format(parseISO(e.createdAt), 'MMM d, yyyy · h:mm a')}
                          </time>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 text-slate-400" /> Actions Performed
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!detail.activity || detail.activity.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-400">No actions recorded yet.</p>
                ) : (
                  <ol className="space-y-3">
                    {detail.activity.map((entry) => (
                      <li key={entry.id} className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {entry.action}
                          </p>
                          {entry.entityType && (
                            <p className="text-xs text-slate-400">{entry.entityType}</p>
                          )}
                        </div>
                        <time className="shrink-0 text-xs text-slate-400">
                          {format(parseISO(entry.createdAt), 'MMM d · h:mm a')}
                        </time>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AssistantDetailPage() {
  return (
    <PermissionRoute permission="assistant.view">
      <AssistantDetailInner />
    </PermissionRoute>
  );
}
