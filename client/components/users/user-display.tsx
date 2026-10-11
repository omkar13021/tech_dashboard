'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ManagedUser, ROLE_META, UserStatus } from '@/types/user.types';
import { UserRole } from '@/types/auth.types';
import { getAvatarTint, getInitials } from '@/lib/user-utils';

/* ------------------------------------------------------------------ */
/* Avatar                                                              */
/* ------------------------------------------------------------------ */

interface UserAvatarProps {
  user: Pick<ManagedUser, 'id' | 'firstName' | 'lastName' | 'profileImage'>;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  return (
    <Avatar className={cn('h-9 w-9', className)}>
      {user.profileImage ? (
        <AvatarImage src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
      ) : null}
      <AvatarFallback className={cn('text-xs font-semibold', getAvatarTint(user.id))}>
        {getInitials(user)}
      </AvatarFallback>
    </Avatar>
  );
}

/* ------------------------------------------------------------------ */
/* Role badge                                                          */
/* ------------------------------------------------------------------ */

export function RoleBadge({
  role,
  className,
}: {
  role: UserRole;
  className?: string;
}) {
  const meta = ROLE_META[role];
  return (
    <Badge
      variant="secondary"
      className={cn('border-transparent font-medium', meta.badgeClass, className)}
    >
      {meta.label}
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/* Status indicator — Azure-style dot + label                         */
/* ------------------------------------------------------------------ */

export function StatusBadge({
  status,
  className,
}: {
  status: UserStatus;
  className?: string;
}) {
  const isActive = status === 'ACTIVE';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium',
        isActive
          ? 'text-emerald-700 dark:text-emerald-400'
          : 'text-slate-500 dark:text-slate-400',
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          isActive ? 'bg-emerald-500' : 'bg-slate-400'
        )}
        aria-hidden
      />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}
