import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  ManagedUser,
  UserDirectoryStats,
  UserWorkStats,
} from '@/types/user.types';
import {
  userApi,
  mapApiUser,
  mapAuditEntry,
  ApiUser,
  UserActionRequest,
  UserQueryParams,
} from '@/services/user.service';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UsersState {
  users: ManagedUser[];
  selectedUser: ManagedUser | null;
  meta: PaginationMeta;
  stats: UserDirectoryStats | null;
  managers: { id: string; name: string }[];
  isLoading: boolean;
  isLoadingDetail: boolean;
  isMutating: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
  stats: null,
  managers: [],
  isLoading: false,
  isLoadingDetail: false,
  isMutating: false,
  error: null,
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const e = error as { response?: { data?: { message?: string } }; message?: string };
    return e.response?.data?.message || e.message || fallback;
  }
  return fallback;
}

type QueryUsersResult =
  | {
      mode: 'list';
      users: ManagedUser[];
      meta: PaginationMeta;
      stats: UserDirectoryStats | null;
      managers: { id: string; name: string }[];
    }
  | { mode: 'detail'; user: ManagedUser };

/**
 * Thunk #1 — the ONLY read thunk. Handles both the paginated list and the
 * single-user detail view (when params.userId is set), keeping to the
 * "two thunks" contract.
 */
export const queryUsers = createAsyncThunk<QueryUsersResult, UserQueryParams>(
  'users/queryUsers',
  async (params, { rejectWithValue }) => {
    try {
      if (params.userId) {
        const res = await userApi.queryOne(params.userId);
        const stats: UserWorkStats | undefined = res.taskStats;
        const user: ManagedUser = {
          ...mapApiUser(res.data),
          stats,
          activity: (res.activity ?? []).map(mapAuditEntry),
        };
        return { mode: 'detail', user };
      }

      const res = await userApi.query(params);
      return {
        mode: 'list',
        users: res.data.map(mapApiUser),
        meta: res.meta,
        stats: res.stats ?? null,
        managers: res.facets?.managers ?? [],
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to load users'));
    }
  },
);

/**
 * Thunk #2 — the ONLY write thunk. Every mutation (create, update, delete,
 * activate/deactivate, reset password, assign role/department/manager) flows
 * through here to POST /users/action.
 */
export const executeUserAction = createAsyncThunk(
  'users/executeAction',
  async (request: UserActionRequest, { rejectWithValue }) => {
    try {
      return await userApi.action(request);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Action failed'));
    }
  },
);

const looksLikeUser = (data: unknown): data is ApiUser =>
  !!data && typeof data === 'object' && 'firstName' in data && 'id' in data;

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    clearUsersError: (state) => {
      state.error = null;
    },
    // Optimistic helpers — the page applies these for instant feedback and
    // re-queries on failure to resync.
    optimisticUpdateUser: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<ManagedUser> }>,
    ) => {
      const { id, changes } = action.payload;
      const idx = state.users.findIndex((u) => u.id === id);
      if (idx !== -1) state.users[idx] = { ...state.users[idx], ...changes };
      if (state.selectedUser?.id === id) {
        state.selectedUser = { ...state.selectedUser, ...changes };
      }
    },
    optimisticRemoveUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((u) => u.id !== action.payload);
      if (state.selectedUser?.id === action.payload) state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // queryUsers
      .addCase(queryUsers.pending, (state, action) => {
        if (action.meta.arg.userId) state.isLoadingDetail = true;
        else state.isLoading = true;
        state.error = null;
      })
      .addCase(queryUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingDetail = false;
        const result = action.payload;
        if (result.mode === 'detail') {
          state.selectedUser = result.user;
        } else {
          state.users = result.users;
          state.meta = result.meta;
          if (result.stats) state.stats = result.stats;
          state.managers = result.managers;
        }
      })
      .addCase(queryUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingDetail = false;
        state.error = action.payload as string;
      })
      // executeUserAction
      .addCase(executeUserAction.pending, (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addCase(executeUserAction.fulfilled, (state, action) => {
        state.isMutating = false;
        const { action: type, data } = action.payload;

        if (type === 'DELETE_USER') {
          const id = (data as { id?: string } | undefined)?.id;
          if (id) {
            state.users = state.users.filter((u) => u.id !== id);
            if (state.selectedUser?.id === id) state.selectedUser = null;
          }
          return;
        }

        if (looksLikeUser(data)) {
          const mapped = mapApiUser(data);
          const idx = state.users.findIndex((u) => u.id === mapped.id);
          if (idx !== -1) {
            state.users[idx] = mapped;
          } else if (type === 'CREATE_USER') {
            state.users.unshift(mapped);
            state.meta.total += 1;
          }
          if (state.selectedUser?.id === mapped.id) {
            state.selectedUser = { ...state.selectedUser, ...mapped };
          }
        }
      })
      .addCase(executeUserAction.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearSelectedUser,
  clearUsersError,
  optimisticUpdateUser,
  optimisticRemoveUser,
} = userSlice.actions;

export default userSlice.reducer;
