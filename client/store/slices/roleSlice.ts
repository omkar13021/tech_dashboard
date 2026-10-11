import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  roleApi,
  RoleListItem,
  RoleDetail,
  RoleQueryParams,
  RoleActionRequest,
  RoleActionResult,
} from '@/services/role.service';
import { permissionApi, PermissionCatalogModule } from '@/services/permission.service';
import { getApiErrorMessage } from '@/lib/apiError';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface RolesState {
  roles: RoleListItem[];
  selectedRole: RoleDetail | null;
  meta: PaginationMeta;
  catalog: PermissionCatalogModule[];
  isLoading: boolean;
  isLoadingDetail: boolean;
  isMutating: boolean;
  error: string | null;
}

const initialState: RolesState = {
  roles: [],
  selectedRole: null,
  meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
  catalog: [],
  isLoading: false,
  isLoadingDetail: false,
  isMutating: false,
  error: null,
};

type QueryRolesResult =
  | { mode: 'list'; roles: RoleListItem[]; meta: PaginationMeta }
  | { mode: 'detail'; role: RoleDetail };

export const queryRoles = createAsyncThunk<QueryRolesResult, RoleQueryParams>(
  'roles/query',
  async (params, { rejectWithValue }) => {
    try {
      if (params.roleId) {
        const role = await roleApi.queryOne(params.roleId, params.includeUsers ?? true);
        return { mode: 'detail', role };
      }
      const res = await roleApi.query(params);
      return { mode: 'list', roles: res.data, meta: res.meta };
    } catch (e) {
      return rejectWithValue(getApiErrorMessage(e, 'Failed to load roles'));
    }
  },
);

export const executeRoleAction = createAsyncThunk<RoleActionResult, RoleActionRequest>(
  'roles/action',
  async (request, { rejectWithValue }) => {
    try {
      return await roleApi.action(request);
    } catch (e) {
      return rejectWithValue(getApiErrorMessage(e, 'Action failed'));
    }
  },
);

export const fetchPermissionCatalog = createAsyncThunk(
  'roles/catalog',
  async (_, { rejectWithValue }) => {
    try {
      const res = await permissionApi.getCatalog();
      return res.modules;
    } catch (e) {
      return rejectWithValue(getApiErrorMessage(e, 'Failed to load permission catalog'));
    }
  },
);

const roleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    clearSelectedRole: (state) => {
      state.selectedRole = null;
    },
    clearRolesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(queryRoles.pending, (state, action) => {
        if (action.meta.arg.roleId) state.isLoadingDetail = true;
        else state.isLoading = true;
        state.error = null;
      })
      .addCase(queryRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingDetail = false;
        if (action.payload.mode === 'detail') {
          state.selectedRole = action.payload.role;
        } else {
          state.roles = action.payload.roles;
          state.meta = action.payload.meta;
        }
      })
      .addCase(queryRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingDetail = false;
        state.error = action.payload as string;
      })
      .addCase(executeRoleAction.pending, (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addCase(executeRoleAction.fulfilled, (state) => {
        state.isMutating = false;
      })
      .addCase(executeRoleAction.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPermissionCatalog.fulfilled, (state, action: PayloadAction<PermissionCatalogModule[]>) => {
        state.catalog = action.payload;
      });
  },
});

export const { clearSelectedRole, clearRolesError } = roleSlice.actions;
export default roleSlice.reducer;
