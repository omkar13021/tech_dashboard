'use client';

import React from 'react';
import { format, parseISO } from 'date-fns';
import {
  Briefcase,
  Building2,
  CalendarDays,
  Mail,
  MapPin,
  Pencil,
  Phone,
  UserCog,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ManagedUser, ROLE_META, departmentLabel } from '@/types/user.types';
import { getFullName } from '@/lib/user-utils';
import { RoleBadge, StatusBadge, UserAvatar } from './user-display';

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
        <div className="text-sm text-slate-700 dark:text-slate-300">{children}</div>
      </div>
    </div>
  );
}

export function UserDetailsCard({
  user,
  onEdit,
  canEdit = true,
}: {
  user: ManagedUser;
  onEdit: () => void;
  canEdit?: boolean;
}) {
  return (
    <Card className="p-0">
      {/* Identity header */}
      <div className="flex flex-col items-center gap-3 px-6 pt-6 pb-5 text-center">
        <UserAvatar user={user} className="h-20 w-20 text-lg" />
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {getFullName(user)}
          </h2>
          {user.jobTitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {user.jobTitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <RoleBadge role={user.role} />
          <StatusBadge status={user.status} />
        </div>
        {canEdit && (
          <Button
            variant="outline"
            size="sm"
            className="mt-1 w-full gap-1.5"
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      <Separator />

      {/* Detail rows */}
      <div className="divide-y divide-border px-6 py-2">
        <DetailRow icon={Mail} label="Email">
          <a
            href={`mailto:${user.email}`}
            className="break-all text-blue-600 hover:underline dark:text-blue-400"
          >
            {user.email}
          </a>
        </DetailRow>

        {user.phone && (
          <DetailRow icon={Phone} label="Phone">
            {user.phone}
          </DetailRow>
        )}

        <DetailRow icon={UserCog} label="Role">
          <span className="font-medium">{ROLE_META[user.role].label}</span>
          <span className="block text-xs text-slate-400">
            {ROLE_META[user.role].description}
          </span>
        </DetailRow>

        <DetailRow icon={Building2} label="Department">
          {departmentLabel(user.department)}
        </DetailRow>

        <DetailRow icon={Briefcase} label="Manager">
          {user.managerName ?? <span className="text-slate-400">No manager assigned</span>}
        </DetailRow>

        {user.location && (
          <DetailRow icon={MapPin} label="Location">
            {user.location}
          </DetailRow>
        )}

        <DetailRow icon={CalendarDays} label="Member since">
          {format(parseISO(user.createdAt), 'MMMM d, yyyy')}
        </DetailRow>
      </div>
    </Card>
  );
}
