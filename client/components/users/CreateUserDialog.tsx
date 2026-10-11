'use client';

import React from 'react';
import { ManagedUser, UserFormValues } from '@/types/user.types';
import { UserFormDialog } from './UserFormDialog';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allUsers: ManagedUser[];
  managerOptions?: { id: string; label: string }[];
  onCreate: (values: UserFormValues) => void | Promise<boolean>;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  allUsers,
  managerOptions,
  onCreate,
}: CreateUserDialogProps) {
  return (
    <UserFormDialog
      open={open}
      onOpenChange={onOpenChange}
      mode="create"
      allUsers={allUsers}
      managerOptions={managerOptions}
      onSubmit={onCreate}
    />
  );
}
