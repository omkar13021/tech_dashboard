'use client';

import React from 'react';
import { ManagedUser, UserFormValues } from '@/types/user.types';
import { UserFormDialog } from './UserFormDialog';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ManagedUser | null;
  allUsers: ManagedUser[];
  managerOptions?: { id: string; label: string }[];
  onSave: (values: UserFormValues) => void | Promise<boolean>;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  allUsers,
  managerOptions,
  onSave,
}: EditUserDialogProps) {
  return (
    <UserFormDialog
      open={open}
      onOpenChange={onOpenChange}
      mode="edit"
      user={user}
      allUsers={allUsers}
      managerOptions={managerOptions}
      onSubmit={onSave}
    />
  );
}
