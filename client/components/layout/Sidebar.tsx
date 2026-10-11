'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { cn } from '@/lib/utils';
import { RootState, AppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { useAuth } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
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
import {
  LayoutDashboard,
  Sun,
  Star,
  Calendar,
  UserCheck,
  Video,
  CheckSquare,
  Search,
  Plus,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}

// Enterprise Color System: All icons use slate gray, blue only for active state
const productivityItems: NavItem[] = [
  { id: 'my-day', label: 'My Day', href: '/my-day', icon: Sun, color: 'text-slate-500' },
  { id: 'important', label: 'Important', href: '/important', icon: Star, color: 'text-slate-500' },
  { id: 'planned', label: 'Planned', href: '/planned', icon: Calendar, color: 'text-slate-500' },
  { id: 'assigned', label: 'Assigned to me', href: '/assigned', icon: UserCheck, color: 'text-slate-500' },
  { id: 'meetings', label: 'Meetings', href: '/meetings', icon: Video, color: 'text-slate-500' },
  { id: 'tasks', label: 'Tasks', href: '/tasks', icon: CheckSquare, color: 'text-slate-500' },
];

const managementItems: NavItem[] = [];

interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  className,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/auth/login');
  };

  const getTaskCount = (itemId: string): number => {
    switch (itemId) {
      case 'my-day':
        return tasks.filter(t => t.isMyDay && !t.isCompleted).length;
      case 'important':
        return tasks.filter(t => t.isImportant && !t.isCompleted).length;
      case 'planned':
        return tasks.filter(t => t.dueDate && !t.isCompleted).length;
      case 'assigned':
        return tasks.filter(t => t.assigneeId && !t.isCompleted).length;
      case 'meetings':
        return tasks.filter(t => t.isMeeting && !t.isCompleted).length;
      case 'tasks':
        return tasks.filter(t => !t.isCompleted).length;
      default:
        return 0;
    }
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const NavLink: React.FC<{ item: NavItem; onItemClick?: () => void }> = ({ item, onItemClick }) => {
    const Icon = item.icon;
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
                  <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
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
        {/* Dashboard */}
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 mb-1',
            'hover:bg-slate-100 dark:hover:bg-slate-800',
            pathname === '/dashboard' && 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-600'
          )}
        >
          <LayoutDashboard
            className={cn(
              'h-5 w-5 flex-shrink-0',
              pathname === '/dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
            )}
          />
          {!isCollapsed && (
            <span
              className={cn(
                'text-sm font-medium',
                pathname === '/dashboard'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300'
              )}
            >
              Dashboard
            </span>
          )}
        </Link>

        {!isCollapsed && <Separator className="my-3" />}

        {/* Personal Productivity Section */}
        {!isCollapsed && (
          <p className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Personal
          </p>
        )}
        <div className="space-y-0.5 mt-1">
          {productivityItems.map((item) => (
            <NavLink key={item.id} item={item} />
          ))}
        </div>

      </nav>


    </div>
  );
};

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <VisuallyHidden>
        <SheetTitle>Navigation Menu</SheetTitle>
      </VisuallyHidden>
      <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
        <Sidebar isCollapsed={false} />
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
