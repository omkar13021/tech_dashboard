'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckSquare, Sun, Star, Calendar, UserCheck, Video, Inbox } from 'lucide-react';

interface TaskEmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const TaskEmptyState: React.FC<TaskEmptyStateProps> = ({
  message = 'No tasks yet',
  icon,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        {icon || <Inbox className="h-8 w-8 text-gray-400" />}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {message}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        Tasks you add will appear here. Start by adding a new task above.
      </p>
    </div>
  );
};

// Category-specific empty states
export const MyDayEmptyState: React.FC = () => (
  <TaskEmptyState
    message="Focus on your day"
    icon={<Sun className="h-8 w-8 text-yellow-500" />}
  />
);

export const ImportantEmptyState: React.FC = () => (
  <TaskEmptyState
    message="No important tasks"
    icon={<Star className="h-8 w-8 text-red-500" />}
  />
);

export const PlannedEmptyState: React.FC = () => (
  <TaskEmptyState
    message="No planned tasks"
    icon={<Calendar className="h-8 w-8 text-green-500" />}
  />
);

export const AssignedEmptyState: React.FC = () => (
  <TaskEmptyState
    message="No tasks assigned to you"
    icon={<UserCheck className="h-8 w-8 text-blue-500" />}
  />
);

export const MeetingsEmptyState: React.FC = () => (
  <TaskEmptyState
    message="No meetings scheduled"
    icon={<Video className="h-8 w-8 text-purple-500" />}
  />
);

export const AllTasksEmptyState: React.FC = () => (
  <TaskEmptyState
    message="No tasks yet"
    icon={<CheckSquare className="h-8 w-8 text-gray-500" />}
  />
);

export default TaskEmptyState;
