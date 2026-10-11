'use client';

import { useMemo } from 'react';
import { Task } from '@/types/task.types';
import { TaskCard } from './TaskCard';
import { TaskGroup } from './TaskGroup';
import { groupTasksByDate, groupTasksByStatus, groupMeetingsByDate, groupTasksByPriority, groupTasksByTimeOfDay, groupTasksByAssignment } from '@/lib/taskGrouping';
import { CheckCircle2 } from 'lucide-react';

type TaskFilter = 'MY_DAY' | 'IMPORTANT' | 'PLANNED' | 'ASSIGNED_TO_ME' | 'MEETINGS' | 'TASKS';

interface PagedTaskListProps {
  tasks: Task[];
  filter: TaskFilter;
  activeGroup: string | null;
}

export function PagedTaskList({ tasks, filter, activeGroup }: PagedTaskListProps) {
  const { filteredTasks, completedTasks } = useMemo(() => {
    // Separate completed tasks
    const completed = tasks.filter(t => t.isCompleted);
    const nonCompleted = tasks.filter(t => !t.isCompleted);
    
    // If "completed" group is selected, show only completed tasks
    if (activeGroup === 'completed') {
      return { filteredTasks: completed, completedTasks: [] };
    }

    // If no group is selected, show all non-completed tasks
    if (activeGroup === null) {
      return { filteredTasks: nonCompleted, completedTasks: completed };
    }

    // Filter non-completed tasks based on the selected group
    let filtered: Task[] = [];
    
    switch (filter) {
      // My Day: Time of day groups
      case 'MY_DAY': {
        const groups = groupTasksByTimeOfDay(nonCompleted);
        switch (activeGroup) {
          case 'morning': filtered = groups.morning; break;
          case 'afternoon': filtered = groups.afternoon; break;
          case 'evening': filtered = groups.evening; break;
          case 'completed': filtered = completed; break;
          default: filtered = nonCompleted;
        }
        break;
      }

      // Important: Priority groups
      case 'IMPORTANT': {
        const groups = groupTasksByPriority(nonCompleted);
        switch (activeGroup) {
          case 'urgent': filtered = groups.urgent; break;
          case 'high': filtered = groups.high; break;
          case 'medium': filtered = groups.medium; break;
          case 'low': filtered = groups.low; break;
          default: filtered = nonCompleted;
        }
        break;
      }

      // Planned: Date groups
      case 'PLANNED': {
        const groups = groupTasksByDate(nonCompleted);
        switch (activeGroup) {
          case 'overdue': filtered = groups.overdue; break;
          case 'today': filtered = groups.today; break;
          case 'tomorrow': filtered = groups.tomorrow; break;
          case 'thisWeek': filtered = groups.thisWeek; break;
          case 'later': filtered = groups.later; break;
          default: filtered = nonCompleted;
        }
        break;
      }

      // Assigned to Me: Assignment status groups
      case 'ASSIGNED_TO_ME': {
        const groups = groupTasksByAssignment(nonCompleted);
        switch (activeGroup) {
          case 'new': filtered = groups.new; break;
          case 'inProgress': filtered = groups.inProgress; break;
          case 'overdue': filtered = groups.overdue; break;
          case 'completed': filtered = completed; break;
          default: filtered = nonCompleted;
        }
        break;
      }

      // Tasks: Status workflow groups
      case 'TASKS': {
        const groups = groupTasksByStatus(nonCompleted);
        switch (activeGroup) {
          case 'todo': filtered = groups.todo; break;
          case 'inProgress': filtered = groups.inProgress; break;
          case 'review': filtered = groups.review; break;
          case 'completed': filtered = completed; break;
          default: filtered = nonCompleted;
        }
        break;
      }

      // Meetings: Time-based groups
      case 'MEETINGS': {
        const groups = groupMeetingsByDate(nonCompleted);
        switch (activeGroup) {
          case 'today': filtered = groups.today; break;
          case 'tomorrow': filtered = groups.tomorrow; break;
          case 'thisWeek': filtered = groups.thisWeek; break;
          case 'upcoming': filtered = groups.upcoming; break;
          case 'past': filtered = groups.past; break;
          default: filtered = nonCompleted;
        }
        break;
      }

      default:
        filtered = nonCompleted;
    }
    
    return { filteredTasks: filtered, completedTasks: completed };
  }, [tasks, filter, activeGroup]);

  if (filteredTasks.length === 0 && completedTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No tasks in this group
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active Group Tasks */}
      {filteredTasks.length > 0 && (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {/* Completed Tasks Section - Always at bottom */}
      {completedTasks.length > 0 && activeGroup !== 'completed' && (
        <div className="mt-6">
          <TaskGroup
            title="Completed"
            tasks={completedTasks}
            icon={<CheckCircle2 className="h-4 w-4" />}
            headerColor="text-emerald-600 dark:text-emerald-400"
            defaultCollapsed={true}
            emptyMessage="No completed tasks"
          />
        </div>
      )}
    </div>
  );
}
