'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { cn } from '@/lib/utils';
import { RootState, AppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { useAuth } from '@/hooks/usePermissions';
import { useAuthz } from '@/hooks/useAuthz';
import { getNavigationForRole } from '@/config/navigation';
import { permissionNavSections } from '@/config/adminNavigation';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Logo } from '@/components/common';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const DynamicSidebar: React.FC<SidebarProps> = ({
  className,
  isCollapsed = false,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href) && href !== '/';
  };

  const getTaskCount = (itemId: string) => {
    if (!tasks.length) return 0;

    switch (itemId) {
      case 'my-day':
        return tasks.filter(t => t.isMyDay && !t.isCompleted).length;
      case 'important':
        return tasks.filter(t => t.isImportant && !t.isCompleted).length;
      case 'planned':
        return tasks.filter(t => t.dueDate && !t.isCompleted).length;
      case 'assigned':
        return tasks.filter(t => t.assignee && !t.isCompleted).length;
      case 'meetings':
        return tasks.filter(t => t.isMeeting && !t.isCompleted).length;
      case 'tasks':
        return tasks.filter(t => !t.isCompleted).length;
      default:
        return 0;
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/auth/login');
  };

  const getIcon = (iconName: string): LucideIcon => {
    const icons = Icons as unknown as Record<string, LucideIcon>;
    return icons[iconName] || Icons.Circle;
  };

  type SidebarNavItem = { id: string; label: string; href: string; icon: string };

  const NavLink: React.FC<{ item: SidebarNavItem; onItemClick?: () => void }> = ({ item, onItemClick }) => {
    const Icon = getIcon(item.icon);
    const active = isActive(item.href);
    const count = getTaskCount(item.id);

    return (
      <Link
        href={item.href}
        onClick={onItemClick}
        className={cn(
          'flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 group',
          'hover:bg-slate-100 dark:hover:bg-slate-800',
          active && 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-600'
        )}
      >
        <div className="flex items-center gap-3">
          <Icon
            className={cn(
              'h-5 w-5 flex-shrink-0',
              active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
            )}
          />
          {!isCollapsed && (
            <span
              className={cn(
                'text-sm font-medium truncate',
                active
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300'
              )}
            >
              {item.label}
            </span>
          )}
        </div>
        {!isCollapsed && count > 0 && (
          <Badge
            variant="secondary"
            className={cn(
              'text-xs min-w-[20px] h-5 justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
              active && 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
            )}
          >
            {count}
          </Badge>
        )}
      </Link>
    );
  };

  const navigationSections = user?.role ? getNavigationForRole(user.role) : [];

  // Permission-driven sections (dynamic, role-agnostic): each item shows only
  // when the user holds the required effective permission.
  const authz = useAuthz();
  const visiblePermissionSections = permissionNavSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.permission
          ? authz.has(item.permission)
          : item.anyPermissions
            ? authz.hasAny(item.anyPermissions)
            : true,
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800',
        isCollapsed ? 'w-16' : 'w-64',
        'transition-all duration-300',
        className
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          'flex items-center h-16 border-b border-slate-200 dark:border-slate-800',
          isCollapsed ? 'justify-center px-2' : 'px-4'
        )}
      >
        <Link href="/dashboard" className="flex items-center" aria-label="Maven Jobs home">
          {isCollapsed ? (
            <Logo variant="mark" className="h-8" priority />
          ) : (
            <Logo variant="default" className="h-8" priority />
          )}
        </Link>
      </div>

      {/* User Profile Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-slate-600 text-white text-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <Icons.ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Icons.Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <Icons.LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-3">
          <div className="relative">
            <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {navigationSections.map((section, sectionIndex) => (
          <div key={section.id}>
            {sectionIndex > 0 && !isCollapsed && <Separator className="my-3" />}
            
            {section.label && !isCollapsed && (
              <p className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {section.label}
              </p>
            )}
            
            <div className="space-y-0.5 mt-1">
              {section.items.map((item) => (
                <NavLink key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}

        {/* Permission-driven sections (Workspace, Administration) */}
        {visiblePermissionSections.map((section) => (
          <div key={section.id}>
            {!isCollapsed && <Separator className="my-3" />}
            {!isCollapsed && (
              <p className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5 mt-1">
              {section.items.map((item) => (
                <NavLink key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
};

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDynamicSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="p-0 w-64">
        <VisuallyHidden>
          <SheetTitle>Navigation Menu</SheetTitle>
        </VisuallyHidden>
        <DynamicSidebar />
      </SheetContent>
    </Sheet>
  );
};
