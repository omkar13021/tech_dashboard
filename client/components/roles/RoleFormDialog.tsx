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
import { RoleDetail } from '@/services/role.service';

export interface RoleFormValues {
  name: string;
  description: string;
  permissionKeys: string[];
}

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  role?: RoleDetail | null;
  catalog: PermissionCatalogModule[];
  onSubmit: (values: RoleFormValues) => void | Promise<boolean>;
}

function RoleForm({
  mode,
  initial,
  catalog,
  allowedKeys,
  onSubmit,
  onCancel,
}: {
  mode: 'create' | 'edit';
  initial: RoleFormValues;
  catalog: PermissionCatalogModule[];
  allowedKeys: string[] | undefined;
  onSubmit: (values: RoleFormValues) => void | Promise<boolean>;
  onCancel: () => void;
}) {
  const [values, setValues] = React.useState<RoleFormValues>(initial);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.name.trim()) {
      setError('Role name is required');
      return;
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
            <Label htmlFor="role-name" className="text-xs text-slate-600 dark:text-slate-400">
              Role Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="role-name"
              value={values.name}
              onChange={(e) => {
                setValues((v) => ({ ...v, name: e.target.value }));
                setError(null);
              }}
              placeholder="e.g. Project Manager"
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role-desc" className="text-xs text-slate-600 dark:text-slate-400">
              Description
            </Label>
            <Input
              id="role-desc"
              value={values.description}
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
              placeholder="What is this role for?"
              className="h-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Permissions
          </Label>
          <PermissionMatrix
            catalog={catalog}
            selected={values.permissionKeys}
            allowedKeys={allowedKeys}
            onChange={(keys) => setValues((v) => ({ ...v, permissionKeys: keys }))}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <DialogFooter className="border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="gap-1.5">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Role' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function RoleFormDialog({
  open,
  onOpenChange,
  mode,
  role,
  catalog,
  onSubmit,
}: RoleFormDialogProps) {
  const { permissions } = useAuthz();

  const initial: RoleFormValues = {
    name: mode === 'edit' && role ? role.name : '',
    description: mode === 'edit' && role ? role.description ?? '' : '',
    permissionKeys: mode === 'edit' && role ? role.permissionKeys : [],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-2xl" showCloseButton>
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="text-base">
            {mode === 'create' ? 'Create Role' : `Edit Role`}
          </DialogTitle>
          <DialogDescription>
            Define the role and assign its permissions. You can only grant permissions you hold.
          </DialogDescription>
        </DialogHeader>
        <RoleForm
          key={`${mode}-${role?.id ?? 'new'}`}
          mode={mode}
          initial={initial}
          catalog={catalog}
          allowedKeys={permissions}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
