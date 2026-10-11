export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TaskCategory = 'MY_DAY' | 'IMPORTANT' | 'PLANNED' | 'ASSIGNED_TO_ME' | 'MEETINGS' | 'TASKS';

export type TaskActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'COMPLETE'
  | 'UNCOMPLETE'
  | 'TOGGLE_IMPORTANT'
  | 'TOGGLE_MY_DAY'
  | 'ASSIGN'
  | 'UNASSIGN'
  | 'CHANGE_PRIORITY'
  | 'CHANGE_STATUS'
  | 'CHANGE_DUE_DATE'
  | 'DUPLICATE'
  | 'ARCHIVE'
  | 'RESTORE'
  | 'BULK_UPDATE'
  | 'BULK_DELETE'
  | 'BULK_COMPLETE'
  | 'BULK_ASSIGN'
  | 'ADD_STEP'
  | 'UPDATE_STEP'
  | 'DELETE_STEP'
  | 'TOGGLE_STEP'
  | 'ADD_COMMENT'
  | 'UPDATE_COMMENT'
  | 'DELETE_COMMENT';

export interface TaskActionPayload {
  action: TaskActionType;
  taskId?: string;
  taskIds?: string[];
  payload?: Record<string, any>;
}

export interface TaskActionResult {
  success: boolean;
  action: TaskActionType;
  data?: any;
  affected?: number;
  message?: string;
}

export interface TaskAssignee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export interface TaskStep {
  id: string;
  title: string;
  isCompleted: boolean;
  order: number;
}

export interface TaskReminder {
  id: string;
  reminderAt: string;
  isTriggered: boolean;
}

export interface TaskAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

export interface TaskComment {
  id: string;
  content: string;
  authorId: string;
  author: TaskAssignee;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  isCompleted: boolean;
  isImportant: boolean;
  isMyDay: boolean;
  dueDate?: string;
  dueTime?: string;
  reminderAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  creatorId: string;
  creator?: TaskAssignee;
  assigneeId?: string;
  assignee?: TaskAssignee;
  
  // Nested data
  steps?: TaskStep[];
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
  
  // Meeting related
  isMeeting?: boolean;
  meetingUrl?: string;
  meetingStartTime?: string;
  meetingEndTime?: string;
  
  // Tags
  tags?: string[];
  
  // Recurrence
  isRecurring?: boolean;
  recurrencePattern?: string;
}

export interface TaskFilters {
  search?: string;
  priority?: TaskPriority[];
  status?: TaskStatus[];
  assigneeId?: string;
  isCompleted?: boolean;
  isImportant?: boolean;
  isMyDay?: boolean;
  dueDateFrom?: string;
  dueDateTo?: string;
  isMeeting?: boolean;
  tags?: string[];
  sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface TasksState {
  tasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  filters: TaskFilters;
  activeCategory: TaskCategory;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  dueTime?: string;
  assigneeId?: string;
  isImportant?: boolean;
  isMyDay?: boolean;
  isMeeting?: boolean;
  meetingUrl?: string;
  meetingStartTime?: string;
  meetingEndTime?: string;
  tags?: string[];
  steps?: Omit<TaskStep, 'id'>[];
}

export interface UpdateTaskPayload {
  id: string;
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  isCompleted?: boolean;
  isImportant?: boolean;
  isMyDay?: boolean;
  dueDate?: string | null;
  dueTime?: string | null;
  assigneeId?: string | null;
  reminderAt?: string | null;
  isMeeting?: boolean;
  meetingUrl?: string;
  meetingStartTime?: string;
  meetingEndTime?: string;
  tags?: string[];
}

export interface TaskNavItem {
  id: TaskCategory;
  label: string;
  icon: string;
  count?: number;
  color?: string;
}

// Enterprise Color System:
// - Slate gray for neutral/default states
// - Blue for active/selected states  
// - Emerald green for completed/success
// - Red for destructive/urgent only
export const TASK_NAV_ITEMS: TaskNavItem[] = [
  { id: 'MY_DAY', label: 'My Day', icon: 'Sun', color: 'text-slate-600' },
  { id: 'IMPORTANT', label: 'Important', icon: 'Star', color: 'text-slate-600' },
  { id: 'PLANNED', label: 'Planned', icon: 'Calendar', color: 'text-slate-600' },
  { id: 'ASSIGNED_TO_ME', label: 'Assigned to me', icon: 'UserCheck', color: 'text-slate-600' },
  { id: 'MEETINGS', label: 'Meetings', icon: 'Video', color: 'text-slate-600' },
  { id: 'TASKS', label: 'Tasks', icon: 'CheckSquare', color: 'text-slate-600' },
];

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  LOW: { label: 'Low', color: 'text-slate-500', bgColor: 'bg-slate-100 dark:bg-slate-800' },
  MEDIUM: { label: 'Medium', color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-800' },
  HIGH: { label: 'High', color: 'text-slate-700', bgColor: 'bg-slate-200 dark:bg-slate-700' },
  URGENT: { label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20' },
};

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  TODO: { label: 'To Do', color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-800' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
  COMPLETED: { label: 'Completed', color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' },
  CANCELLED: { label: 'Cancelled', color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20' },
};
