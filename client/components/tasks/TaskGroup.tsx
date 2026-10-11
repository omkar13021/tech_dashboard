'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Task } from '@/types/task.types';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';

interface TaskGroupProps {
  title: string;
  tasks: Task[];
  count?: number;
  defaultCollapsed?: boolean;
  emptyMessage?: string;
  icon?: React.ReactNode;
  headerColor?: string;
}

export function TaskGroup({
  title,
  tasks,
  count,
  defaultCollapsed = false,
  emptyMessage,
  icon,
  headerColor = 'text-slate-700 dark:text-slate-300',
}: TaskGroupProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const taskCount = count ?? tasks.length;

  if (taskCount === 0 && !emptyMessage) {
    return null;
  }

  return (
    <div className="mb-4">
      {/* Group Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors group",
          isCollapsed && "mb-0"
        )}
      >
        <div className="flex items-center gap-2">
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
          {icon && <span className="text-slate-500">{icon}</span>}
          <h3 className={cn("font-semibold text-sm", headerColor)}>
            {title}
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {taskCount}
          </span>
        </div>
      </button>

      {/* Task List */}
      {!isCollapsed && (
        <div className="mt-2 space-y-2">
          {tasks.length === 0 && emptyMessage ? (
            <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              {emptyMessage}
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
