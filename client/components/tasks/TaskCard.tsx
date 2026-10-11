'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import { AppDispatch, RootState } from '@/store';
import {
  setSelectedTask,
  executeTaskAction,
} from '@/store/slices/taskSlice';
import { Task, PRIORITY_CONFIG } from '@/types/task.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu';
import {
  Star,
  Sun,
  Calendar,
  Clock,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  Flag,
  Video,
  Trash2,
  Edit,
  User,
  Copy,
  FolderKanban,
  CalendarDays,
} from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onDelete?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete, onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedTask } = useSelector((state: RootState) => state.tasks);
  const isSelected = selectedTask?.id === task.id;
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    // Single click - select task and show details panel
    if (clickTimeout) {
      // This is a double click
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      handleDoubleClick();
    } else {
      // Wait to see if it's a double click
      const timeout = setTimeout(() => {
        // Single click confirmed
        if (isSelected) {
          dispatch(setSelectedTask(null));
        } else {
          dispatch(setSelectedTask(task));
        }
        setClickTimeout(null);
      }, 250);
      setClickTimeout(timeout);
    }
  };

  const handleDoubleClick = () => {
    // Double click - open full edit modal
    onEdit?.(task);
  };

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(executeTaskAction({
      action: task.isCompleted ? 'UNCOMPLETE' : 'COMPLETE',
      taskId: task.id,
    }));
  };

  const handleToggleImportant = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(executeTaskAction({
      action: 'TOGGLE_IMPORTANT',
      taskId: task.id,
      payload: { isImportant: !task.isImportant },
    }));
  };

  const handleToggleMyDay = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(executeTaskAction({
      action: 'TOGGLE_MY_DAY',
      taskId: task.id,
      payload: { isMyDay: !task.isMyDay },
    }));
  };

  const handleToggleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = task.status === 'CANCELLED' ? 'TODO' : 'CANCELLED';
    dispatch(executeTaskAction({
      action: 'CHANGE_STATUS',
      taskId: task.id,
      payload: { status: newStatus },
    }));
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(executeTaskAction({
      action: 'DUPLICATE',
      taskId: task.id,
    }));
  };

  const formatDueDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const getDueDateColor = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (task.isCompleted) return 'text-slate-400';
    if (isPast(date) && !isToday(date)) return 'text-red-600';
    if (isToday(date)) return 'text-blue-600';
    return 'text-slate-500';
  };

  const priorityConfig = PRIORITY_CONFIG[task.priority];

  // Context menu actions
  const contextMenuActions = (
    <>
      <ContextMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleToggleImportant(e); }}>
        <Star className="h-4 w-4 mr-2" />
        {task.isImportant ? 'Remove from Important' : 'Mark as Important'}
      </ContextMenuItem>
      <ContextMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleToggleComplete(e); }}>
        <CheckCircle2 className="h-4 w-4 mr-2" />
        {task.isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <CalendarDays className="h-4 w-4 mr-2" />
          Due Date
        </ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Sun className="h-4 w-4 mr-2" />
            Today
          </ContextMenuItem>
          <ContextMenuItem onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Calendar className="h-4 w-4 mr-2" />
            Tomorrow
          </ContextMenuItem>
          <ContextMenuItem onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <CalendarDays className="h-4 w-4 mr-2" />
            Pick Date
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <User className="h-4 w-4 mr-2" />
          Assign User
        </ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            Assign to me
          </ContextMenuItem>
          <ContextMenuItem onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            Assign to someone else
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <FolderKanban className="h-4 w-4 mr-2" />
          Move to Project
        </ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            Project 1
          </ContextMenuItem>
          <ContextMenuItem onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            Project 2
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDuplicate(e); }}>
        <Copy className="h-4 w-4 mr-2" />
        Duplicate Task
      </ContextMenuItem>
      <ContextMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDoubleClick(); }}>
        <Edit className="h-4 w-4 mr-2" />
        Edit Task
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem 
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleToggleCancel(e); }}
        className={task.status === 'CANCELLED' ? 'text-blue-600 focus:text-blue-600' : 'text-slate-600 focus:text-slate-600'}
      >
        <Circle className="h-4 w-4 mr-2" />
        {task.status === 'CANCELLED' ? 'Uncancel Task' : 'Cancel Task'}
      </ContextMenuItem>
    </>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          onClick={handleClick}
          className={cn(
            'group flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border transition-all duration-200 cursor-pointer',
            isSelected 
              ? 'border-blue-500 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm' 
              : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-750',
            task.isCompleted && 'opacity-70'
          )}
        >
      {/* Checkbox */}
      <button
        onClick={handleToggleComplete}
        className="flex-shrink-0 mt-0.5"
      >
        {task.isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <Circle className="h-5 w-5 text-slate-400 hover:text-blue-500 transition-colors" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <h3
          className={cn(
            'text-sm font-medium text-slate-900 dark:text-slate-100 truncate',
            task.isCompleted && 'line-through text-slate-500'
          )}
        >
          {task.title}
        </h3>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          {/* Meeting badge */}
          {task.isMeeting && (
            <Badge variant="secondary" className="gap-1 text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 pointer-events-none">
              <Video className="h-3 w-3" />
              Meeting
            </Badge>
          )}

          {/* Priority */}
          {task.priority !== 'MEDIUM' && (
            <Badge variant="secondary" className={cn('gap-1', priorityConfig.bgColor, priorityConfig.color, 'pointer-events-none')}>
              <Flag className="h-3 w-3" />
              {priorityConfig.label}
            </Badge>
          )}

          {/* Due date */}
          {task.dueDate && (
            <span className={cn('flex items-center gap-1 text-xs', getDueDateColor(task.dueDate), 'pointer-events-none')}>
              <Calendar className="h-3 w-3" />
              {formatDueDate(task.dueDate)}
              {task.dueTime && (
                <>
                  <Clock className="h-3 w-3 ml-1" />
                  {task.dueTime}
                </>
              )}
            </span>
          )}

          {/* My Day indicator */}
          {task.isMyDay && !task.isCompleted && (
            <span className="flex items-center gap-1 text-xs text-blue-600 pointer-events-none">
              <Sun className="h-3 w-3" />
              My Day
            </span>
          )}

          {/* Assignee */}
          {task.assignee && (
            <span className="flex items-center gap-1 text-xs text-slate-500 pointer-events-none">
              <div className="h-4 w-4 rounded-full bg-slate-500 flex items-center justify-center text-white text-[10px] font-medium">
                {task.assignee.firstName[0]}
              </div>
              {task.assignee.firstName}
            </span>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex gap-1 pointer-events-none">
              {task.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs py-0">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge variant="outline" className="text-xs py-0">
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Important star */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleImportant}
          className={cn(
            'h-8 w-8 p-0',
            task.isImportant ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'
          )}
        >
          <Star className={cn('h-4 w-4', task.isImportant && 'fill-current')} />
        </Button>

        {/* My Day sun */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleMyDay}
          className={cn(
            'h-8 w-8 p-0',
            task.isMyDay ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'
          )}
        >
          <Sun className={cn('h-4 w-4', task.isMyDay && 'fill-current')} />
        </Button>

        {/* More actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-400"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleImportant(e); }}>
              <Star className="h-4 w-4 mr-2" />
              {task.isImportant ? 'Remove from Important' : 'Mark as Important'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleComplete(e); }}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {task.isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <CalendarDays className="h-4 w-4 mr-2" />
                Due Date
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  <Sun className="h-4 w-4 mr-2" />
                  Today
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Tomorrow
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Pick Date
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <User className="h-4 w-4 mr-2" />
                Assign User
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  Assign to me
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  Assign to someone else
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FolderKanban className="h-4 w-4 mr-2" />
                Move to Project
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  Project 1
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  Project 2
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(e); }}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate Task
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDoubleClick(); }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Task
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); handleToggleCancel(e); }}
              className={task.status === 'CANCELLED' ? 'text-blue-600' : 'text-slate-600'}
            >
              <Circle className="h-4 w-4 mr-2" />
              {task.status === 'CANCELLED' ? 'Uncancel Task' : 'Cancel Task'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {contextMenuActions}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default TaskCard;
