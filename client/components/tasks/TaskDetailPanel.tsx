'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import { RootState, AppDispatch } from '@/store';
import { executeTaskAction } from '@/store/slices/taskSlice';
import { Task, PRIORITY_CONFIG, STATUS_CONFIG } from '@/types/task.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  X,
  Star,
  Sun,
  Calendar as CalendarIcon,
  Clock,
  Bell,
  Paperclip,
  MessageSquare,
  Trash2,
  MoreHorizontal,
  Flag,
  User,
  CheckCircle2,
  Circle,
  Link as LinkIcon,
  Video,
} from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';

interface TaskDetailPanelProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isUpdating, isDeleting } = useSelector((state: RootState) => state.tasks);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    }
  }, [task]);

  if (!task) return null;

  const handleTitleBlur = () => {
    if (title !== task.title && title.trim()) {
      dispatch(executeTaskAction({
        action: 'UPDATE',
        taskId: task.id,
        payload: { title: title.trim() },
      }));
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== (task.description || '')) {
      dispatch(executeTaskAction({
        action: 'UPDATE',
        taskId: task.id,
        payload: { description },
      }));
    }
  };

  const handleToggleComplete = () => {
    dispatch(executeTaskAction({
      action: task.isCompleted ? 'UNCOMPLETE' : 'COMPLETE',
      taskId: task.id,
    }));
  };

  const handleToggleImportant = () => {
    dispatch(executeTaskAction({
      action: 'TOGGLE_IMPORTANT',
      taskId: task.id,
      payload: { isImportant: !task.isImportant },
    }));
  };

  const handleToggleMyDay = () => {
    dispatch(executeTaskAction({
      action: 'TOGGLE_MY_DAY',
      taskId: task.id,
      payload: { isMyDay: !task.isMyDay },
    }));
  };

  const handlePriorityChange = (priority: string) => {
    dispatch(executeTaskAction({
      action: 'CHANGE_PRIORITY',
      taskId: task.id,
      payload: { priority },
    }));
  };

  const handleStatusChange = (status: string) => {
    dispatch(executeTaskAction({
      action: 'CHANGE_STATUS',
      taskId: task.id,
      payload: { status },
    }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    dispatch(executeTaskAction({
      action: 'CHANGE_DUE_DATE',
      taskId: task.id,
      payload: { dueDate: date?.toISOString() || null },
    }));
  };

  const handleDelete = () => {
    dispatch(executeTaskAction({
      action: 'DELETE',
      taskId: task.id,
    }));
    onClose();
  };

  const formatDueDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  const getDueDateColor = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isPast(date) && !isToday(date)) return 'text-red-600';
    if (isToday(date)) return 'text-blue-600';
    return 'text-slate-600 dark:text-slate-400';
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 md:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-full md:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 z-50 transform transition-transform duration-300 ease-in-out overflow-hidden flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleComplete}
              className="flex-shrink-0"
            >
              {task.isCompleted ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              ) : (
                <Circle className="h-6 w-6 text-slate-400 hover:text-slate-600" />
              )}
            </button>
            <span className="text-sm text-slate-500">
              {task.isCompleted ? 'Completed' : 'Mark complete'}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Title */}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className={cn(
              'text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0',
              task.isCompleted && 'line-through text-slate-500'
            )}
            placeholder="Task title"
          />

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={task.isMyDay ? 'default' : 'outline'}
              size="sm"
              onClick={handleToggleMyDay}
              className={cn(
                'gap-2',
                task.isMyDay && 'bg-blue-600 hover:bg-blue-700 text-white'
              )}
            >
              <Sun className="h-4 w-4" />
              My Day
            </Button>
            <Button
              variant={task.isImportant ? 'default' : 'outline'}
              size="sm"
              onClick={handleToggleImportant}
              className={cn(
                'gap-2',
                task.isImportant && 'bg-blue-600 hover:bg-blue-700 text-white'
              )}
            >
              <Star className="h-4 w-4" />
              Important
            </Button>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Due Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !task.dueDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {task.dueDate ? (
                    <span className={getDueDateColor(task.dueDate)}>
                      {formatDueDate(task.dueDate)}
                    </span>
                  ) : (
                    'Add due date'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={task.dueDate ? parseISO(task.dueDate) : undefined}
                  onSelect={handleDateSelect}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Priority
            </label>
            <Select value={task.priority} onValueChange={handlePriorityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Flag className={cn('h-4 w-4', config.color)} />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Status
            </label>
            <Select value={task.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div className={cn('h-2 w-2 rounded-full', config.bgColor)} />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Meeting Info */}
          {task.isMeeting && (
            <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Video className="h-4 w-4" />
                <span className="text-sm font-medium">Meeting</span>
              </div>
              {task.meetingUrl && (
                <a
                  href={task.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <LinkIcon className="h-4 w-4" />
                  Join meeting
                </a>
              )}
              {task.meetingStartTime && task.meetingEndTime && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Clock className="h-4 w-4" />
                  {task.meetingStartTime} - {task.meetingEndTime}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Notes
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Add notes..."
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Assignee */}
          {task.assignee && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Assigned to
              </label>
              <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center text-white text-sm font-medium">
                  {task.assignee.firstName[0]}{task.assignee.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {task.assignee.firstName} {task.assignee.lastName}
                  </p>
                  <p className="text-xs text-slate-500">{task.assignee.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2 text-xs text-slate-500">
            <p>Created: {format(parseISO(task.createdAt), 'MMM d, yyyy h:mm a')}</p>
            <p>Updated: {format(parseISO(task.updatedAt), 'MMM d, yyyy h:mm a')}</p>
            {task.completedAt && (
              <p>Completed: {format(parseISO(task.completedAt), 'MMM d, yyyy h:mm a')}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete task
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete task?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the task
                  "{task.title}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </>
  );
};

export default TaskDetailPanel;
