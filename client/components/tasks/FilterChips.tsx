'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  X, 
  Flag, 
  Circle, 
  Calendar, 
  FolderKanban,
  ArrowUpDown,
  User,
  Tag,
  Zap,
} from 'lucide-react';
import { TaskPriority, TaskStatus } from '@/types/task.types';

export interface FilterState {
  priorities: TaskPriority[];
  statuses: TaskStatus[];
  dueDateRange?: 'today' | 'this-week' | 'this-month' | 'overdue';
  projects: string[];
  assignees: string[];
  tags: string[];
  sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

interface FilterChipsProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
}

const PRIORITY_CONFIG = {
  URGENT: { label: 'Urgent', emoji: '🔴', color: 'bg-red-100 text-red-700 border-red-300' },
  HIGH: { label: 'High', emoji: '🔥', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  MEDIUM: { label: 'Medium', emoji: '🟡', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  LOW: { label: 'Low', emoji: '🟢', color: 'bg-green-100 text-green-700 border-green-300' },
};

const STATUS_CONFIG = {
  TODO: { label: 'To Do', emoji: '⭕', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  IN_PROGRESS: { label: 'In Progress', emoji: '⏳', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  COMPLETED: { label: 'Completed', emoji: '✅', color: 'bg-green-100 text-green-700 border-green-300' },
  CANCELLED: { label: 'Cancelled', emoji: '❌', color: 'bg-gray-100 text-gray-700 border-gray-300' },
};

const DUE_DATE_CONFIG = {
  today: { label: 'Today', emoji: '📅' },
  'this-week': { label: 'This Week', emoji: '📆' },
  'this-month': { label: 'This Month', emoji: '🗓️' },
  overdue: { label: 'Overdue', emoji: '⚠️' },
};

const SORT_CONFIG = {
  dueDate: { label: 'Due Date', icon: Calendar },
  priority: { label: 'Priority', icon: Flag },
  createdAt: { label: 'Created', icon: Zap },
  title: { label: 'Alphabetical', icon: ArrowUpDown },
};

export const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onFiltersChange,
  className,
}) => {
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const hasActiveFilters = 
    filters.priorities.length > 0 ||
    filters.statuses.length > 0 ||
    filters.dueDateRange ||
    filters.projects.length > 0 ||
    filters.assignees.length > 0 ||
    filters.tags.length > 0;

  const togglePriority = (priority: TaskPriority) => {
    const newPriorities = filters.priorities.includes(priority)
      ? filters.priorities.filter(p => p !== priority)
      : [...filters.priorities, priority];
    onFiltersChange({ ...filters, priorities: newPriorities });
  };

  const toggleStatus = (status: TaskStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: newStatuses });
  };

  const setDueDateRange = (range: typeof filters.dueDateRange) => {
    onFiltersChange({ ...filters, dueDateRange: range });
    setDueDateOpen(false);
  };

  const setSort = (sortBy: typeof filters.sortBy, sortOrder: typeof filters.sortOrder = 'asc') => {
    onFiltersChange({ ...filters, sortBy, sortOrder });
    setSortOpen(false);
  };

  const clearFilters = () => {
    onFiltersChange({
      priorities: [],
      statuses: [],
      projects: [],
      assignees: [],
      tags: [],
    });
  };

  const removePriority = (priority: TaskPriority) => {
    onFiltersChange({
      ...filters,
      priorities: filters.priorities.filter(p => p !== priority),
    });
  };

  const removeStatus = (status: TaskStatus) => {
    onFiltersChange({
      ...filters,
      statuses: filters.statuses.filter(s => s !== status),
    });
  };

  const removeDueDateRange = () => {
    onFiltersChange({ ...filters, dueDateRange: undefined });
  };

  const removeSort = () => {
    onFiltersChange({ ...filters, sortBy: undefined, sortOrder: undefined });
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {/* Active Priority Chips */}
      {filters.priorities.map((priority) => {
        const config = PRIORITY_CONFIG[priority];
        return (
          <Badge
            key={priority}
            variant="outline"
            className={cn(
              'px-3 py-1.5 text-sm font-medium border cursor-pointer hover:opacity-80 transition-opacity',
              config.color
            )}
          >
            <span className="mr-1.5">{config.emoji}</span>
            {config.label}
            <button
              onClick={() => removePriority(priority)}
              className="ml-2 hover:bg-black/10 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      })}

      {/* Active Status Chips */}
      {filters.statuses.map((status) => {
        const config = STATUS_CONFIG[status];
        return (
          <Badge
            key={status}
            variant="outline"
            className={cn(
              'px-3 py-1.5 text-sm font-medium border cursor-pointer hover:opacity-80 transition-opacity',
              config.color
            )}
          >
            <span className="mr-1.5">{config.emoji}</span>
            {config.label}
            <button
              onClick={() => removeStatus(status)}
              className="ml-2 hover:bg-black/10 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      })}

      {/* Active Due Date Chip */}
      {filters.dueDateRange && (
        <Badge
          variant="outline"
          className="px-3 py-1.5 text-sm font-medium border bg-purple-100 text-purple-700 border-purple-300 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <span className="mr-1.5">{DUE_DATE_CONFIG[filters.dueDateRange].emoji}</span>
          {DUE_DATE_CONFIG[filters.dueDateRange].label}
          <button
            onClick={removeDueDateRange}
            className="ml-2 hover:bg-black/10 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Active Sort Chip */}
      {filters.sortBy && (
        <Badge
          variant="outline"
          className="px-3 py-1.5 text-sm font-medium border bg-indigo-100 text-indigo-700 border-indigo-300 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <ArrowUpDown className="h-3 w-3 mr-1.5" />
          {SORT_CONFIG[filters.sortBy].label}
          {filters.sortOrder === 'desc' ? ' ↓' : ' ↑'}
          <button
            onClick={removeSort}
            className="ml-2 hover:bg-black/10 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Priority Filter Dropdown */}
      {filters.priorities.length === 0 && (
        <DropdownMenu open={priorityOpen} onOpenChange={setPriorityOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-sm font-normal text-gray-600 hover:text-gray-900 border-dashed"
            >
              <Flag className="h-3.5 w-3.5 mr-1.5" />
              Priority
              <Plus className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => togglePriority(key as TaskPriority)}
                className="cursor-pointer"
              >
                <span className="mr-2">{config.emoji}</span>
                {config.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Status Filter Dropdown */}
      {filters.statuses.length === 0 && (
        <DropdownMenu open={statusOpen} onOpenChange={setStatusOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-sm font-normal text-gray-600 hover:text-gray-900 border-dashed"
            >
              <Circle className="h-3.5 w-3.5 mr-1.5" />
              Status
              <Plus className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => toggleStatus(key as TaskStatus)}
                className="cursor-pointer"
              >
                <span className="mr-2">{config.emoji}</span>
                {config.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Due Date Filter Dropdown */}
      {!filters.dueDateRange && (
        <DropdownMenu open={dueDateOpen} onOpenChange={setDueDateOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-sm font-normal text-gray-600 hover:text-gray-900 border-dashed"
            >
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Due Date
              <Plus className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Filter by Due Date</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(DUE_DATE_CONFIG).map(([key, config]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => setDueDateRange(key as any)}
                className="cursor-pointer"
              >
                <span className="mr-2">{config.emoji}</span>
                {config.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Sort Dropdown */}
      {!filters.sortBy && (
        <DropdownMenu open={sortOpen} onOpenChange={setSortOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-sm font-normal text-gray-600 hover:text-gray-900 border-dashed"
            >
              <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" />
              Sort
              <Plus className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(SORT_CONFIG).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setSort(key as any, 'asc')}
                  className="cursor-pointer"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {config.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-8 px-3 text-sm text-gray-500 hover:text-gray-900"
        >
          <X className="h-3.5 w-3.5 mr-1.5" />
          Clear
        </Button>
      )}
    </div>
  );
};
