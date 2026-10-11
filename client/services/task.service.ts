import axiosInstance from "@/lib/axios";
import {
  Task,
  TaskFilters,
  TaskActionPayload,
  TaskActionResult,
} from "@/types/task.types";

export interface TasksResponse {
  data: Task[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardSummary {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  myDayTasks: number;
  importantTasks: number;
  plannedTasks: number;
  assignedTasks: number;
  meetingTasks: number;
  overdueTasks: number;
}

export const taskService = {
  async executeAction(actionPayload: TaskActionPayload): Promise<TaskActionResult> {
    const response = await axiosInstance.post<TaskActionResult>(
      "/tasks/action",
      actionPayload
    );
    return response.data;
  },

  async queryTasks(filters?: TaskFilters): Promise<TasksResponse> {
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.priority && filters.priority.length > 0) {
      filters.priority.forEach((p) => params.append("priority", p));
    }
    if (filters?.status && filters.status.length > 0) {
      filters.status.forEach((s) => params.append("status", s));
    }
    if (filters?.assigneeId) params.append("assigneeId", filters.assigneeId);
    if (filters?.isCompleted !== undefined)
      params.append("isCompleted", String(filters.isCompleted));
    if (filters?.isImportant !== undefined)
      params.append("isImportant", String(filters.isImportant));
    if (filters?.isMyDay !== undefined)
      params.append("isMyDay", String(filters.isMyDay));
    if (filters?.dueDateFrom) params.append("dueDateFrom", filters.dueDateFrom);
    if (filters?.dueDateTo) params.append("dueDateTo", filters.dueDateTo);
    if (filters?.isMeeting !== undefined)
      params.append("isMeeting", String(filters.isMeeting));
    if (filters?.tags && filters.tags.length > 0) {
      filters.tags.forEach((t) => params.append("tags", t));
    }
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

    const response = await axiosInstance.get<TasksResponse>("/tasks/query", {
      params,
    });
    return response.data;
  },

  async getTask(id: string): Promise<Task> {
    const response = await axiosInstance.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  async getMyDayTasks(): Promise<TasksResponse> {
    const response = await axiosInstance.get<TasksResponse>("/tasks/my-day");
    return response.data;
  },

  async getImportantTasks(): Promise<TasksResponse> {
    const response = await axiosInstance.get<TasksResponse>(
      "/tasks/important"
    );
    return response.data;
  },

  async getPlannedTasks(): Promise<TasksResponse> {
    const response = await axiosInstance.get<TasksResponse>("/tasks/planned");
    return response.data;
  },

  async getAssignedTasks(): Promise<TasksResponse> {
    const response = await axiosInstance.get<TasksResponse>("/tasks/assigned");
    return response.data;
  },

  async getMeetingTasks(): Promise<TasksResponse> {
    const response = await axiosInstance.get<TasksResponse>("/tasks/meetings");
    return response.data;
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await axiosInstance.get<DashboardSummary>(
      "/tasks/dashboard"
    );
    return response.data;
  },
};
