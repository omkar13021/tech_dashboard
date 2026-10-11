'use client';

import { cn } from '@/lib/utils';
import { Circle, PlayCircle, Eye, Ban, CheckCircle2, AlertTriangle, ArrowUp, Minus, Calendar, Clock, AlertCircle, Video, History } from 'lucide-react';

type TaskFilter = 'MY_DAY' | 'IMPORTANT' | 'PLANNED' | 'ASSIGNED_TO_ME' | 'MEETINGS' | 'TASKS';

interface GroupButton {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  count?: number;
}

interface GroupNavigationProps {
  filter: TaskFilter;
  activeGroup: string | null;
  onGroupSelect: (groupId: string | null) => void;
  groupCounts: Record<string, number>;
}

// Enterprise Color System:
// - Slate gray for neutral/default states
// - Blue for active/selected states  
// - Emerald green for completed/success
// - Red for overdue/destructive
const getGroupButtons = (filter: TaskFilter): GroupButton[] => {
  switch (filter) {
    case 'MY_DAY':
      return [
        { id: 'morning', label: 'Morning', icon: <Clock className="h-4 w-4" />, color: 'text-slate-600 dark:text-slate-400' },
        { id: 'afternoon', label: 'Afternoon', icon: <Clock className="h-4 w-4" />, color: 'text-slate-600 dark:text-slate-400' },
        { id: 'evening', label: 'Evening', icon: <Clock className="h-4 w-4" />, color: 'text-slate-600 dark:text-slate-400' },
        { id: 'completed', label: 'Completed', icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-emerald-600 dark:text-emerald-400' },
      ];
    
    case 'IMPORTANT':
      return [
        { id: 'urgent', label: 'Urgent', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-red-600 dark:text-red-400' },
        { id: 'high', label: 'High', icon: <ArrowUp className="h-4 w-4" />, color: 'text-slate-700 dark:text-slate-300' },
        { id: 'medium', label: 'Medium', icon: <Minus className="h-4 w-4" />, color: 'text-slate-600 dark:text-slate-400' },
        { id: 'low', label: 'Low', icon: <Minus className="h-4 w-4" />, color: 'text-slate-500 dark:text-slate-500' },
      ];
    
    case 'PLANNED':
      return [
        { id: 'overdue', label: 'Overdue', icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-600 dark:text-red-400' },
        { id: 'today', label: 'Today', icon: <Calendar className="h-4 w-4" />, color: 'text-blue-600 dark:text-blue-400' },
        { id: 'tomorrow', label: 'Tomorrow', icon: <Clock className="h-4 w-4" />, color: 'text-slate-600 dark:text-slate-400' },
        { id: 'thisWeek', label: 'This Week', icon: <Calendar className="h-4 w-4" />, color: 'text-slate-600 dark:text-slate-400' },
        { id: 'later', label: 'Later', icon: <Calendar className="h-4 w-4" />, color: 'text-slate-500 dark:text-slate-500' },
      ];
    
    case 'ASSIGNED_TO_ME':
      return [
        { id: 'new', label: 'New', icon: <Circle className="h-4 w-4" />, color: 'text-blue-600 dark:text-blue-400' },
        { id: 'inProgress', label: 'In Progress', icon: <PlayCircle className="h-4 w-4" />, color: 'text-slate-600 dark:text-slate-400' },
        { id: 'overdue', label: 'Overdue', icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-600 dark:text-red-400' },
        { id: 'completed', label: 'Completed', icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-emerald-600 dark:text-emerald-400' },
      ];

    case 'TASKS':
      return [
        { id: 'todo', label: 'To Do', icon: <Circle className="h-4 w-4" />, color: 'text-slate-600 dark:text-slate-400' },
        { id: 'inProgress', label: 'In Progress', icon: <PlayCircle className="h-4 w-4" />, color: 'text-blue-600 dark:text-blue-400' },
        { id: 'review', label: 'Review', icon: <Eye className="h-4 w-4" />, color: 'text-slate-600 dark:text-slate-400' },
        { id: 'completed', label: 'Completed', icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-emerald-600 dark:text-emerald-400' },
      ];
    
    case 'MEETINGS':
      return [
        { id: 'today', label: 'Today', icon: <Video className="h-4 w-4" />, color: 'text-blue-600 dark:text-blue-400' },
        { id: 'tomorrow', label: 'Tomorrow', icon: <Clock className="h-4 w-4" />, color: 'text-slate-600 dark:text-slate-400' },
        { id: 'thisWeek', label: 'This Week', icon: <Calendar className="h-4 w-4" />, color: 'text-slate-600 dark:text-slate-400' },
        { id: 'upcoming', label: 'Upcoming', icon: <Calendar className="h-4 w-4" />, color: 'text-slate-500 dark:text-slate-500' },
        { id: 'past', label: 'Past', icon: <History className="h-4 w-4" />, color: 'text-slate-400 dark:text-slate-500' },
      ];
    
    default:
      return [];
  }
};

export function GroupNavigation({ filter, activeGroup, onGroupSelect, groupCounts }: GroupNavigationProps) {
  const buttons = getGroupButtons(filter);

  return (
    <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {/* All button */}
        <button
          onClick={() => onGroupSelect(null)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap border",
            activeGroup === null
              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
          )}
        >
          All
        </button>

        {/* Group buttons */}
        {buttons.map((button) => {
          const count = groupCounts[button.id] || 0;
          const isActive = activeGroup === button.id;
          return (
            <button
              key={button.id}
              onClick={() => onGroupSelect(button.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap border",
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700",
                !isActive && button.color
              )}
            >
              {button.icon}
              <span>{button.label}</span>
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
