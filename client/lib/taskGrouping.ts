import { Task } from '@/types/task.types';
import { parseISO, startOfDay, endOfDay, addDays, startOfWeek, endOfWeek, getHours } from 'date-fns';

export interface TaskGroup {
  title: string;
  tasks: Task[];
  count: number;
  icon?: string;
  color?: string;
}

// My Day: Time of day groups
export interface MyDayGroups {
  morning: Task[];
  afternoon: Task[];
  evening: Task[];
  completed: Task[];
}

// Planned: Date-based groups
export interface PlannedGroups {
  overdue: Task[];
  today: Task[];
  tomorrow: Task[];
  thisWeek: Task[];
  nextWeek: Task[];
  later: Task[];
}

// Tasks: Status workflow groups
export interface StatusGroups {
  todo: Task[];
  inProgress: Task[];
  review: Task[];
  blocked: Task[];
  completed: Task[];
}

// Assigned to Me: Assignment status groups
export interface AssignedGroups {
  new: Task[];
  inProgress: Task[];
  overdue: Task[];
  completed: Task[];
}

// Meetings: Time-based groups
export interface MeetingGroups {
  today: Task[];
  tomorrow: Task[];
  thisWeek: Task[];
  upcoming: Task[];
  past: Task[];
}

// Important: Priority groups
export interface PriorityGroups {
  urgent: Task[];
  high: Task[];
  medium: Task[];
  low: Task[];
}

// My Day: Group by time of day (morning/afternoon/evening)
export function groupTasksByTimeOfDay(tasks: Task[]): MyDayGroups {
  const groups: MyDayGroups = {
    morning: [],
    afternoon: [],
    evening: [],
    completed: [],
  };

  tasks.forEach(task => {
    if (task.isCompleted) {
      groups.completed.push(task);
      return;
    }

    // Use due time or created time to determine time slot
    const timeStr = task.dueTime || '12:00';
    const hour = parseInt(timeStr.split(':')[0], 10);

    if (hour < 12) {
      groups.morning.push(task);
    } else if (hour < 17) {
      groups.afternoon.push(task);
    } else {
      groups.evening.push(task);
    }
  });

  return groups;
}

// Planned: Group by due date
export function groupTasksByDate(tasks: Task[]): PlannedGroups {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const tomorrowStart = startOfDay(addDays(now, 1));
  const tomorrowEnd = endOfDay(addDays(now, 1));
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 0 });
  const nextWeekEnd = endOfWeek(addDays(now, 7), { weekStartsOn: 0 });

  const groups: PlannedGroups = {
    overdue: [],
    today: [],
    tomorrow: [],
    thisWeek: [],
    nextWeek: [],
    later: [],
  };

  tasks.forEach(task => {
    if (!task.dueDate) {
      groups.later.push(task);
      return;
    }

    const dueDate = parseISO(task.dueDate);

    if (dueDate < todayStart && !task.isCompleted) {
      groups.overdue.push(task);
    } else if (dueDate >= todayStart && dueDate <= todayEnd) {
      groups.today.push(task);
    } else if (dueDate >= tomorrowStart && dueDate <= tomorrowEnd) {
      groups.tomorrow.push(task);
    } else if (dueDate > tomorrowEnd && dueDate <= thisWeekEnd) {
      groups.thisWeek.push(task);
    } else if (dueDate > thisWeekEnd && dueDate <= nextWeekEnd) {
      groups.nextWeek.push(task);
    } else {
      groups.later.push(task);
    }
  });

  return groups;
}

// Tasks: Group by status workflow
export function groupTasksByStatus(tasks: Task[]): StatusGroups {
  const groups: StatusGroups = {
    todo: [],
    inProgress: [],
    review: [],
    blocked: [],
    completed: [],
  };

  tasks.forEach(task => {
    if (task.isCompleted || task.status === 'COMPLETED') {
      groups.completed.push(task);
    } else if (task.status === 'IN_PROGRESS') {
      groups.inProgress.push(task);
    } else if (task.status === 'CANCELLED') {
      groups.review.push(task); // Cancelled tasks go to review for reconsideration
    } else {
      groups.todo.push(task);
    }
  });

  return groups;
}

// Assigned to Me: Group by assignment status
export function groupTasksByAssignment(tasks: Task[]): AssignedGroups {
  const now = new Date();
  const todayStart = startOfDay(now);

  const groups: AssignedGroups = {
    new: [],
    inProgress: [],
    overdue: [],
    completed: [],
  };

  tasks.forEach(task => {
    if (task.isCompleted) {
      groups.completed.push(task);
      return;
    }

    // Check if overdue
    if (task.dueDate) {
      const dueDate = parseISO(task.dueDate);
      if (dueDate < todayStart) {
        groups.overdue.push(task);
        return;
      }
    }

    // Check status
    if (task.status === 'IN_PROGRESS') {
      groups.inProgress.push(task);
    } else {
      groups.new.push(task);
    }
  });

  return groups;
}

export function groupMeetingsByDate(tasks: Task[]): MeetingGroups {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const tomorrowStart = startOfDay(addDays(now, 1));
  const tomorrowEnd = endOfDay(addDays(now, 1));
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 0 });

  const groups: MeetingGroups = {
    today: [],
    tomorrow: [],
    thisWeek: [],
    upcoming: [],
    past: [],
  };

  tasks.forEach(task => {
    if (!task.dueDate) {
      groups.upcoming.push(task);
      return;
    }

    const dueDate = parseISO(task.dueDate);

    if (dueDate < todayStart) {
      groups.past.push(task);
    } else if (dueDate >= todayStart && dueDate <= todayEnd) {
      groups.today.push(task);
    } else if (dueDate >= tomorrowStart && dueDate <= tomorrowEnd) {
      groups.tomorrow.push(task);
    } else if (dueDate > tomorrowEnd && dueDate <= thisWeekEnd) {
      groups.thisWeek.push(task);
    } else {
      groups.upcoming.push(task);
    }
  });

  return groups;
}

export function groupTasksByPriority(tasks: Task[]): PriorityGroups {
  const groups: PriorityGroups = {
    urgent: [],
    high: [],
    medium: [],
    low: [],
  };

  tasks.forEach(task => {
    switch (task.priority) {
      case 'URGENT':
        groups.urgent.push(task);
        break;
      case 'HIGH':
        groups.high.push(task);
        break;
      case 'MEDIUM':
        groups.medium.push(task);
        break;
      case 'LOW':
        groups.low.push(task);
        break;
      default:
        groups.medium.push(task);
    }
  });

  return groups;
}
