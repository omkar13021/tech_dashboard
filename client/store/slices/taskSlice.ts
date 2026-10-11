import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Task,
  TasksState,
  TaskFilters,
  TaskCategory,
  TaskActionPayload,
  TaskActionResult,
  TaskActionType,
} from '@/types/task.types';
import { taskService } from '@/services/task.service';

const initialState: TasksState = {
  tasks: [],
  selectedTask: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  filters: {},
  activeCategory: 'MY_DAY',
};

export const queryTasks = createAsyncThunk(
  'tasks/queryTasks',
  async (filters: TaskFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await taskService.queryTasks(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch tasks');
    }
  }
);

export const executeTaskAction = createAsyncThunk(
  'tasks/executeAction',
  async (actionPayload: TaskActionPayload, { rejectWithValue }) => {
    try {
      const result = await taskService.executeAction(actionPayload);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to execute action');
    }
  }
);

const BULK_ACTIONS: TaskActionType[] = ['BULK_UPDATE', 'BULK_DELETE', 'BULK_COMPLETE', 'BULK_ASSIGN'];
const DELETE_ACTIONS: TaskActionType[] = ['DELETE', 'BULK_DELETE'];
const CREATE_ACTIONS: TaskActionType[] = ['CREATE', 'DUPLICATE'];

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setActiveCategory: (state, action: PayloadAction<TaskCategory>) => {
      state.activeCategory = action.payload;
    },
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload;
    },
    setFilters: (state, action: PayloadAction<TaskFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    optimisticUpdate: (state, action: PayloadAction<{ taskId: string; updates: Partial<Task> }>) => {
      const { taskId, updates } = action.payload;
      const index = state.tasks.findIndex(t => t.id === taskId);
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...updates };
      }
      if (state.selectedTask?.id === taskId) {
        state.selectedTask = { ...state.selectedTask, ...updates };
      }
    },
    optimisticDelete: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
      if (state.selectedTask?.id === action.payload) {
        state.selectedTask = null;
      }
    },
    optimisticAdd: (state, action: PayloadAction<Task>) => {
      state.tasks.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(queryTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(queryTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(queryTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(executeTaskAction.pending, (state, action) => {
        const actionType = action.meta.arg.action;
        if (CREATE_ACTIONS.includes(actionType)) {
          state.isCreating = true;
        } else if (DELETE_ACTIONS.includes(actionType)) {
          state.isDeleting = true;
        } else {
          state.isUpdating = true;
        }
        state.error = null;
      })
      .addCase(executeTaskAction.fulfilled, (state, action) => {
        const result = action.payload;
        const actionType = result.action;
        
        state.isCreating = false;
        state.isUpdating = false;
        state.isDeleting = false;

        if (CREATE_ACTIONS.includes(actionType)) {
          if (result.data && !Array.isArray(result.data)) {
            const existingIndex = state.tasks.findIndex(t => t.id === result.data.id);
            if (existingIndex === -1) {
              state.tasks.unshift(result.data);
            }
          }
        } else if (actionType === 'DELETE') {
          if (result.data?.id) {
            state.tasks = state.tasks.filter(t => t.id !== result.data.id);
            if (state.selectedTask?.id === result.data.id) {
              state.selectedTask = null;
            }
          }
        } else if (actionType === 'BULK_DELETE') {
          if (result.data?.deletedIds) {
            const deletedIds = result.data.deletedIds as string[];
            state.tasks = state.tasks.filter(t => !deletedIds.includes(t.id));
            if (state.selectedTask && deletedIds.includes(state.selectedTask.id)) {
              state.selectedTask = null;
            }
          }
        } else if (BULK_ACTIONS.includes(actionType) && Array.isArray(result.data)) {
          result.data.forEach((updatedTask: Task) => {
            const index = state.tasks.findIndex(t => t.id === updatedTask.id);
            if (index !== -1) {
              state.tasks[index] = updatedTask;
            }
          });
          if (state.selectedTask) {
            const updatedSelected = result.data.find((t: Task) => t.id === state.selectedTask?.id);
            if (updatedSelected) {
              state.selectedTask = updatedSelected;
            }
          }
        } else if (result.data && !Array.isArray(result.data)) {
          const index = state.tasks.findIndex(t => t.id === result.data.id);
          if (index !== -1) {
            state.tasks[index] = result.data;
          }
          if (state.selectedTask?.id === result.data.id) {
            state.selectedTask = result.data;
          }
        }
      })
      .addCase(executeTaskAction.rejected, (state, action) => {
        state.isCreating = false;
        state.isUpdating = false;
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setActiveCategory,
  setSelectedTask,
  setFilters,
  clearFilters,
  clearError,
  optimisticUpdate,
  optimisticDelete,
  optimisticAdd,
} = taskSlice.actions;

export const fetchTasks = queryTasks;

export default taskSlice.reducer;
