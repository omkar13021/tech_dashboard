'use client';

import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import { RootState, AppDispatch } from '@/store';
import { executeTaskAction, setSelectedTask } from '@/store/slices/taskSlice';
import { Task, TaskCategory, PRIORITY_CONFIG } from '@/types/task.types';
import { TaskCard } from './TaskCard';
import { TaskListSkeleton } from './TaskListSkeleton';
import { FilterChips, FilterState } from './FilterChips';
import { VoiceInput } from './VoiceInput';
import { GroupedTaskList } from './GroupedTaskList';
import { GroupNavigation } from './GroupNavigation';
import { PagedTaskList } from './PagedTaskList';
import { groupTasksByDate, groupTasksByStatus, groupMeetingsByDate, groupTasksByPriority, groupTasksByTimeOfDay, groupTasksByAssignment } from '@/lib/taskGrouping';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  ChevronDown,
  X,
  Sun,
  Star,
  Calendar,
  UserCheck,
  Video,
  CheckSquare,
  Inbox,
  MoreHorizontal,
} from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';

type TaskFilter = 'MY_DAY' | 'IMPORTANT' | 'PLANNED' | 'ASSIGNED_TO_ME' | 'MEETINGS' | 'TASKS';

interface TaskPageProps {
  filter: TaskFilter;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor?: string;
  backgroundImage?: string;
  backgroundColor?: string;
}

export const TaskPage: React.FC<TaskPageProps> = ({
  filter,
  title,
  subtitle,
  icon,
  iconColor,
  backgroundImage,
  backgroundColor = 'bg-gradient-to-br from-blue-400 to-blue-600',
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, isLoading, isCreating } = useSelector((state: RootState) => state.tasks);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt' | 'title'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [localFilters, setLocalFilters] = useState<FilterState>({
    priorities: [],
    statuses: [],
    projects: [],
    assignees: [],
    tags: [],
  });

  // Filter tasks based on category
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Category-based filtering
    switch (filter) {
      case 'MY_DAY':
        result = result.filter(t => t.isMyDay);
        break;
      case 'IMPORTANT':
        result = result.filter(t => t.isImportant);
        break;
      case 'PLANNED':
        result = result.filter(t => t.dueDate);
        break;
      case 'ASSIGNED_TO_ME':
        result = result.filter(t => t.assigneeId);
        break;
      case 'MEETINGS':
        result = result.filter(t => t.isMeeting);
        break;
      case 'TASKS':
        // Show all tasks
        break;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        t =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Priority filter
    if (localFilters.priorities.length > 0) {
      result = result.filter(t => localFilters.priorities.includes(t.priority));
    }

    // Status filter
    if (localFilters.statuses.length > 0) {
      result = result.filter(t => localFilters.statuses.includes(t.status));
    }

    // Due date filter
    if (localFilters.dueDateRange) {
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);
      
      result = result.filter(t => {
        if (!t.dueDate) return false;
        const dueDate = parseISO(t.dueDate);
        
        switch (localFilters.dueDateRange) {
          case 'today':
            return isToday(dueDate);
          case 'this-week':
            const weekEnd = new Date(todayStart);
            weekEnd.setDate(weekEnd.getDate() + 7);
            return dueDate >= todayStart && dueDate <= weekEnd;
          case 'this-month':
            const monthEnd = new Date(todayStart);
            monthEnd.setDate(monthEnd.getDate() + 30);
            return dueDate >= todayStart && dueDate <= monthEnd;
          case 'overdue':
            return dueDate < todayStart && !t.isCompleted;
          default:
            return true;
        }
      });
    }

    // Completed filter
    if (!showCompleted) {
      result = result.filter(t => !t.isCompleted);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'priority':
          const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'createdAt':
        default:
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tasks, filter, searchQuery, showCompleted, sortBy, sortOrder, localFilters]);

  const completedCount = useMemo(() => {
    return tasks.filter(t => {
      let matches = t.isCompleted;
      switch (filter) {
        case 'MY_DAY':
          return t.isMyDay && t.isCompleted;
        case 'IMPORTANT':
          return t.isImportant && t.isCompleted;
        case 'PLANNED':
          return t.dueDate && t.isCompleted;
        case 'ASSIGNED_TO_ME':
          return t.assigneeId && t.isCompleted;
        case 'MEETINGS':
          return t.isMeeting && t.isCompleted;
        default:
          return t.isCompleted;
      }
    }).length;
  }, [tasks, filter]);

  // Calculate group counts for navigation
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    switch (filter) {
      // My Day: Time of day groups
      case 'MY_DAY': {
        const groups = groupTasksByTimeOfDay(filteredTasks);
        counts.morning = groups.morning.length;
        counts.afternoon = groups.afternoon.length;
        counts.evening = groups.evening.length;
        counts.completed = groups.completed.length;
        break;
      }
      // Important: Priority groups
      case 'IMPORTANT': {
        const groups = groupTasksByPriority(filteredTasks);
        counts.urgent = groups.urgent.length;
        counts.high = groups.high.length;
        counts.medium = groups.medium.length;
        counts.low = groups.low.length;
        break;
      }
      // Planned: Date groups
      case 'PLANNED': {
        const groups = groupTasksByDate(filteredTasks);
        counts.overdue = groups.overdue.length;
        counts.today = groups.today.length;
        counts.tomorrow = groups.tomorrow.length;
        counts.thisWeek = groups.thisWeek.length;
        counts.later = groups.later.length;
        break;
      }
      // Assigned to Me: Assignment status groups
      case 'ASSIGNED_TO_ME': {
        const groups = groupTasksByAssignment(filteredTasks);
        counts.new = groups.new.length;
        counts.inProgress = groups.inProgress.length;
        counts.overdue = groups.overdue.length;
        counts.completed = groups.completed.length;
        break;
      }
      // Tasks: Status workflow groups
      case 'TASKS': {
        const groups = groupTasksByStatus(filteredTasks);
        counts.todo = groups.todo.length;
        counts.inProgress = groups.inProgress.length;
        counts.review = groups.review.length;
        counts.completed = groups.completed.length;
        break;
      }
      // Meetings: Time-based groups
      case 'MEETINGS': {
        const groups = groupMeetingsByDate(filteredTasks);
        counts.today = groups.today.length;
        counts.tomorrow = groups.tomorrow.length;
        counts.thisWeek = groups.thisWeek.length;
        counts.upcoming = groups.upcoming.length;
        counts.past = groups.past.length;
        break;
      }
    }
    
    return counts;
  }, [filteredTasks, filter]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const payload: any = {
      title: newTaskTitle.trim(),
    };

    // Set filter-specific defaults
    switch (filter) {
      case 'MY_DAY':
        payload.isMyDay = true;
        payload.dueDate = new Date().toISOString();
        break;
      case 'IMPORTANT':
        payload.isImportant = true;
        break;
      case 'PLANNED':
        payload.dueDate = new Date().toISOString();
        break;
      case 'MEETINGS':
        payload.isMeeting = true;
        payload.dueDate = new Date().toISOString();
        break;
    }

    await dispatch(executeTaskAction({
      action: 'CREATE',
      payload,
    }));
    setNewTaskTitle('');
  };

  const handleDeleteTask = (taskId: string) => {
    dispatch(executeTaskAction({
      action: 'DELETE',
      taskId,
    }));
  };

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (isLoading) {
    return <TaskListSkeleton />;
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Header - Clean enterprise style */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {icon}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
              {subtitle && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Task List Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900">
        {/* Group Navigation */}
        <GroupNavigation
          filter={filter}
          activeGroup={activeGroup}
          onGroupSelect={setActiveGroup}
          groupCounts={groupCounts}
        />

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-slate-900">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Inbox className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                No tasks found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                Tasks you add will appear here. Start by adding a new task below.
              </p>
            </div>
          ) : (
            <PagedTaskList 
              tasks={filteredTasks} 
              filter={filter} 
              activeGroup={activeGroup}
            />
          )}
        </div>

        {/* Add Task Input - Bottom */}
        <form onSubmit={handleAddTask} className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
            <div className="h-5 w-5 rounded-full border-2 border-slate-300 dark:border-slate-600 flex-shrink-0" />
            <Input
              placeholder="Add a task"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 text-sm"
              disabled={isCreating}
            />
            <VoiceInput 
              onTranscript={(transcript) => setNewTaskTitle(prev => prev ? `${prev} ${transcript}` : transcript)}
            />
            {newTaskTitle.trim() && (
              <Button type="submit" size="sm" disabled={isCreating}>
                Add
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskPage;
