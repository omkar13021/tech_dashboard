'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TaskListSkeletonProps {
  count?: number;
  className?: string;
}

export const TaskListSkeleton: React.FC<TaskListSkeletonProps> = ({
  count = 5,
  className,
}) => {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header Skeleton */}
      <div className="flex-shrink-0 p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div>
              <div className="h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mt-1 animate-pulse" />
            </div>
          </div>
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        </div>

        {/* Search and Filters Skeleton */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
        </div>

        {/* Add Task Skeleton */}
        <div className="mt-4 flex gap-2">
          <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
          <div className="h-10 w-16 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
        </div>
      </div>

      {/* Task Cards Skeleton */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="space-y-2">
          {Array.from({ length: count }).map((_, index) => (
            <TaskCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const TaskCardSkeleton: React.FC = () => {
  return (
    <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Checkbox */}
      <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0 mt-0.5" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    </div>
  );
};

export default TaskListSkeleton;
