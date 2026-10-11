'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PermissionMatrix } from '@/components/authz/PermissionMatrix';
import { useAuthz } from '@/hooks/useAuthz';
import { PermissionCatalogModule } from '@/services/permission.service';
import { AssistantListItem } from '@/services/assistant.service';

export interface AssistantFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  jobTitle: string;
  permissionKeys: string[];
}

interface AssistantFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  assistant?: AssistantListItem | null;
  catalog: PermissionCatalogModule[];
  onSubmit: (values: AssistantFormValues) => void | Promise<boolean>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AssistantForm({
  mode,
  initial,
  catalog,
  principalPermissions,
  onSubmit,
  onCancel,
}: {
  mode: 'create' | 'edit';
  initial: AssistantFormValues;
  catalog: PermissionCatalogModule[];
  principalPermissions: string[];
  onSubmit: (values: AssistantFormValues) => void | Promise<boolean>;
  onCancel: () => void;
}) {
  const [values, setValues] = React.useState<AssistantFormValues>(initial);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const set = <K extends keyof AssistantFormValues>(k: K, v: AssistantFormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.firstName.trim() || !values.lastName.trim()) {
      setError('First and last name are required');
      return;
    }
    if (mode === 'create') {
      if (!EMAIL_RE.test(values.email)) {
        setError('A valid email is required');
        return;
      }
      if (values.password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
    }
    setSubmitting(true);
    const result = await onSubmit(values);
    if (result === false) setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
      <div className="max-h-[calc(90vh-9.5rem)] space-y-5 overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600 dark:text-slate-400">
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input value={values.firstName} onChange={(e) => set('firstName', e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600 dark:text-slate-400">
              Last Name <span className="text-destructive">*</span>
            </Label>
            <Input value={values.lastName} onChange={(e) => set('lastName', e.target.value)} className="h-9" />
          </div>
        </div>

        {mode === 'create' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600 dark:text-slate-400">
                Login Email <span className="text-destructive">*</span>
              </Label>
              <Input
                type="email"
                value={values.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="assistant@company.com"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600 dark:text-slate-400">
                Temporary Password <span className="text-destructive">*</span>
              </Label>
              <Input
                type="password"
                value={values.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="h-9"
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs text-slate-600 dark:text-slate-400">Job Title</Label>
          <Input value={values.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} className="h-9" />
        </div>

        {mode === 'create' && (
          <div className="space-y-2 border-t pt-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Delegated Permissions
              </Label>
              <p className="text-xs text-slate-500">
                You can only grant permissions you hold. Restricted ones are locked.
              </p>
            </div>
            <PermissionMatrix
              catalog={catalog}
              selected={values.permissionKeys}
              allowedKeys={principalPermissions}
              onChange={(keys) => set('permissionKeys', keys)}
            />
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <DialogFooter className="border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="gap-1.5">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Assistant' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AssistantFormDialog({
  open,
  onOpenChange,
  mode,
  assistant,
  catalog,
  onSubmit,
}: AssistantFormDialogProps) {
  const { permissions } = useAuthz();

  const initial: AssistantFormValues = {
    firstName: mode === 'edit' && assistant ? assistant.firstName : '',
    lastName: mode === 'edit' && assistant ? assistant.lastName : '',
    email: mode === 'edit' && assistant ? assistant.email : '',
    password: '',
    jobTitle: '',
    permissionKeys: [],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-2xl" showCloseButton>
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="text-base">
            {mode === 'create' ? 'Create Assistant' : 'Edit Assistant'}
          </DialogTitle>
          <DialogDescription>
            An assistant is a delegated user with their own login. Their permissions can never
            exceed yours.
          </DialogDescription>
        </DialogHeader>
        <AssistantForm
          key={`${mode}-${assistant?.id ?? 'new'}`}
          mode={mode}
          initial={initial}
          catalog={catalog}
          principalPermissions={permissions}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
