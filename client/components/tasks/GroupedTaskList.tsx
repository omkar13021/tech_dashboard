'use client';

import { useMemo } from 'react';
import { Task } from '@/types/task.types';
import { TaskCard } from './TaskCard';
import { TaskGroup } from './TaskGroup';
import { groupTasksByDate, groupTasksByStatus, groupMeetingsByDate, groupTasksByPriority } from '@/lib/taskGrouping';
import { Calendar, Clock, AlertCircle, Circle, PlayCircle, Eye, Ban, CheckCircle2, Video, History, AlertTriangle, ArrowUp, Minus } from 'lucide-react';

type TaskFilter = 'MY_DAY' | 'IMPORTANT' | 'PLANNED' | 'ASSIGNED_TO_ME' | 'MEETINGS' | 'TASKS';

interface GroupedTaskListProps {
  tasks: Task[];
  filter: TaskFilter;
  showCompleted?: boolean;
}

export function GroupedTaskList({ tasks, filter, showCompleted = false }: GroupedTaskListProps) {
  const renderGroupedTasks = useMemo(() => {
    switch (filter) {
      case 'MY_DAY': {
        // Group My Day tasks by status
        const groups = groupTasksByStatus(tasks);
        return (
          <div className="space-y-1">
            <TaskGroup
              title="To Do"
              tasks={groups.todo}
              icon={<Circle className="h-4 w-4" />}
              headerColor="text-gray-600 dark:text-gray-400"
              emptyMessage="No tasks to do"
            />
            <TaskGroup
              title="In Progress"
              tasks={groups.inProgress}
              icon={<PlayCircle className="h-4 w-4" />}
              headerColor="text-blue-600 dark:text-blue-400"
              emptyMessage="No tasks in progress"
            />
            <TaskGroup
              title="Review"
              tasks={groups.review}
              icon={<Eye className="h-4 w-4" />}
              headerColor="text-purple-600 dark:text-purple-400"
              emptyMessage="No tasks in review"
            />
            <TaskGroup
              title="Blocked"
              tasks={groups.blocked}
              icon={<Ban className="h-4 w-4" />}
              headerColor="text-orange-600 dark:text-orange-400"
              emptyMessage="No blocked tasks"
            />
            {showCompleted && (
              <TaskGroup
                title="Completed"
                tasks={groups.completed}
                icon={<CheckCircle2 className="h-4 w-4" />}
                headerColor="text-green-600 dark:text-green-400"
                defaultCollapsed={true}
                emptyMessage="No completed tasks"
              />
            )}
          </div>
        );
      }

      case 'IMPORTANT': {
        // Group Important tasks by priority
        const groups = groupTasksByPriority(tasks);
        return (
          <div className="space-y-1">
            <TaskGroup
              title="Urgent"
              tasks={groups.urgent}
              icon={<AlertTriangle className="h-4 w-4" />}
              headerColor="text-red-600 dark:text-red-400"
              emptyMessage="No urgent tasks"
            />
            <TaskGroup
              title="High Priority"
              tasks={groups.high}
              icon={<ArrowUp className="h-4 w-4" />}
              headerColor="text-orange-600 dark:text-orange-400"
              emptyMessage="No high priority tasks"
            />
            <TaskGroup
              title="Medium Priority"
              tasks={groups.medium}
              icon={<Minus className="h-4 w-4" />}
              headerColor="text-blue-600 dark:text-blue-400"
              emptyMessage="No medium priority tasks"
            />
            <TaskGroup
              title="Low Priority"
              tasks={groups.low}
              icon={<Minus className="h-4 w-4" />}
              headerColor="text-gray-600 dark:text-gray-400"
              emptyMessage="No low priority tasks"
            />
          </div>
        );
      }

      case 'PLANNED': {
        const groups = groupTasksByDate(tasks);
        return (
          <div className="space-y-1">
            <TaskGroup
              title="Earlier"
              tasks={groups.overdue}
              icon={<AlertCircle className="h-4 w-4" />}
              headerColor="text-red-600 dark:text-red-400"
              emptyMessage="No overdue tasks"
            />
            <TaskGroup
              title="Today"
              tasks={groups.today}
              icon={<Calendar className="h-4 w-4" />}
              headerColor="text-blue-600 dark:text-blue-400"
              emptyMessage="No tasks due today"
            />
            <TaskGroup
              title="Tomorrow"
              tasks={groups.tomorrow}
              icon={<Clock className="h-4 w-4" />}
              headerColor="text-green-600 dark:text-green-400"
              emptyMessage="No tasks due tomorrow"
            />
            <TaskGroup
              title="This Week"
              tasks={groups.thisWeek}
              icon={<Calendar className="h-4 w-4" />}
              emptyMessage="No tasks due this week"
            />
            <TaskGroup
              title="Next Week"
              tasks={groups.nextWeek}
              icon={<Calendar className="h-4 w-4" />}
              emptyMessage="No tasks due next week"
            />
            <TaskGroup
              title="Later"
              tasks={groups.later}
              icon={<Calendar className="h-4 w-4" />}
              emptyMessage="No tasks scheduled for later"
            />
          </div>
        );
      }

      case 'ASSIGNED_TO_ME':
      case 'TASKS': {
        const groups = groupTasksByStatus(tasks);
        return (
          <div className="space-y-1">
            <TaskGroup
              title="To Do"
              tasks={groups.todo}
              icon={<Circle className="h-4 w-4" />}
              headerColor="text-gray-600 dark:text-gray-400"
              emptyMessage="No tasks to do"
            />
            <TaskGroup
              title="In Progress"
              tasks={groups.inProgress}
              icon={<PlayCircle className="h-4 w-4" />}
              headerColor="text-blue-600 dark:text-blue-400"
              emptyMessage="No tasks in progress"
            />
            <TaskGroup
              title="Review"
              tasks={groups.review}
              icon={<Eye className="h-4 w-4" />}
              headerColor="text-purple-600 dark:text-purple-400"
              emptyMessage="No tasks in review"
            />
            <TaskGroup
              title="Blocked"
              tasks={groups.blocked}
              icon={<Ban className="h-4 w-4" />}
              headerColor="text-orange-600 dark:text-orange-400"
              emptyMessage="No blocked tasks"
            />
            {showCompleted && (
              <TaskGroup
                title="Completed"
                tasks={groups.completed}
                icon={<CheckCircle2 className="h-4 w-4" />}
                headerColor="text-green-600 dark:text-green-400"
                defaultCollapsed={true}
                emptyMessage="No completed tasks"
              />
            )}
          </div>
        );
      }

      case 'MEETINGS': {
        const groups = groupMeetingsByDate(tasks);
        return (
          <div className="space-y-1">
            <TaskGroup
              title="Today"
              tasks={groups.today}
              icon={<Video className="h-4 w-4" />}
              headerColor="text-blue-600 dark:text-blue-400"
              emptyMessage="No meetings today"
            />
            <TaskGroup
              title="Tomorrow"
              tasks={groups.tomorrow}
              icon={<Clock className="h-4 w-4" />}
              headerColor="text-green-600 dark:text-green-400"
              emptyMessage="No meetings tomorrow"
            />
            <TaskGroup
              title="This Week"
              tasks={groups.thisWeek}
              icon={<Calendar className="h-4 w-4" />}
              emptyMessage="No meetings this week"
            />
            <TaskGroup
              title="Upcoming"
              tasks={groups.upcoming}
              icon={<Calendar className="h-4 w-4" />}
              emptyMessage="No upcoming meetings"
            />
            {showCompleted && (
              <TaskGroup
                title="Past Meetings"
                tasks={groups.past}
                icon={<History className="h-4 w-4" />}
                headerColor="text-gray-500 dark:text-gray-400"
                defaultCollapsed={true}
                emptyMessage="No past meetings"
              />
            )}
          </div>
        );
      }

      default:
        return null;
    }
  }, [tasks, filter, showCompleted]);

  return <>{renderGroupedTasks}</>;
}
