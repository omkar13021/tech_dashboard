import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  performanceApi,
  PerformanceQueryParams,
  SetTargetPayload,
  ResetTargetPayload,
  TeamDashboard,
  MemberDetail,
  TargetsResponse,
} from '@/services/performance.service';
import { getApiErrorMessage } from '@/lib/apiError';

interface PerformanceState {
  dashboard: TeamDashboard | null;
  isDashboardLoading: boolean;
  dashboardError: string | null;
  lastUpdated: string | null;

  memberDetail: MemberDetail | null;
  isMemberLoading: boolean;
  memberError: string | null;

  targets: TargetsResponse | null;
  isTargetsLoading: boolean;
  isSavingTarget: boolean;
  targetError: string | null;
}

const initialState: PerformanceState = {
  dashboard: null,
  isDashboardLoading: false,
  dashboardError: null,
  lastUpdated: null,

  memberDetail: null,
  isMemberLoading: false,
  memberError: null,

  targets: null,
  isTargetsLoading: false,
  isSavingTarget: false,
  targetError: null,
};

export const fetchTeamDashboard = createAsyncThunk(
  'performance/teamDashboard',
  async (params: PerformanceQueryParams, { rejectWithValue }) => {
    try {
      return await performanceApi.teamDashboard(params);
    } catch (e) {
      return rejectWithValue(getApiErrorMessage(e, 'Failed to load the performance dashboard'));
    }
  },
);

export const fetchMemberDetail = createAsyncThunk(
  'performance/memberDetail',
  async (params: PerformanceQueryParams, { rejectWithValue }) => {
    try {
      return await performanceApi.memberDetail(params);
    } catch (e) {
      return rejectWithValue(getApiErrorMessage(e, 'Failed to load member performance'));
    }
  },
);

export const fetchTargets = createAsyncThunk(
  'performance/targets',
  async (_: void, { rejectWithValue }) => {
    try {
      return await performanceApi.getTargets();
    } catch (e) {
      return rejectWithValue(getApiErrorMessage(e, 'Failed to load targets'));
    }
  },
);

export const saveTarget = createAsyncThunk(
  'performance/saveTarget',
  async (payload: SetTargetPayload, { rejectWithValue }) => {
    try {
      await performanceApi.setTarget(payload);
      return await performanceApi.getTargets();
    } catch (e) {
      return rejectWithValue(getApiErrorMessage(e, 'Failed to save target'));
    }
  },
);

export const resetTarget = createAsyncThunk(
  'performance/resetTarget',
  async (payload: ResetTargetPayload, { rejectWithValue }) => {
    try {
      await performanceApi.resetTarget(payload);
      return await performanceApi.getTargets();
    } catch (e) {
      return rejectWithValue(getApiErrorMessage(e, 'Failed to reset target'));
    }
  },
);

const performanceSlice = createSlice({
  name: 'performance',
  initialState,
  reducers: {
    clearMemberDetail: (state) => {
      state.memberDetail = null;
      state.memberError = null;
    },
    clearTargetError: (state) => {
      state.targetError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* team dashboard */
      .addCase(fetchTeamDashboard.pending, (state) => {
        state.isDashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(fetchTeamDashboard.fulfilled, (state, action) => {
        state.isDashboardLoading = false;
        state.dashboard = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchTeamDashboard.rejected, (state, action) => {
        state.isDashboardLoading = false;
        state.dashboardError = action.payload as string;
      })
      /* member detail */
      .addCase(fetchMemberDetail.pending, (state) => {
        state.isMemberLoading = true;
        state.memberError = null;
      })
      .addCase(fetchMemberDetail.fulfilled, (state, action) => {
        state.isMemberLoading = false;
        state.memberDetail = action.payload;
      })
      .addCase(fetchMemberDetail.rejected, (state, action) => {
        state.isMemberLoading = false;
        state.memberError = action.payload as string;
      })
      /* targets */
      .addCase(fetchTargets.pending, (state) => {
        state.isTargetsLoading = true;
        state.targetError = null;
      })
      .addCase(fetchTargets.fulfilled, (state, action) => {
        state.isTargetsLoading = false;
        state.targets = action.payload;
      })
      .addCase(fetchTargets.rejected, (state, action) => {
        state.isTargetsLoading = false;
        state.targetError = action.payload as string;
      })
      .addCase(saveTarget.pending, (state) => {
        state.isSavingTarget = true;
        state.targetError = null;
      })
      .addCase(saveTarget.fulfilled, (state, action) => {
        state.isSavingTarget = false;
        state.targets = action.payload;
      })
      .addCase(saveTarget.rejected, (state, action) => {
        state.isSavingTarget = false;
        state.targetError = action.payload as string;
      })
      .addCase(resetTarget.pending, (state) => {
        state.isSavingTarget = true;
        state.targetError = null;
      })
      .addCase(resetTarget.fulfilled, (state, action) => {
        state.isSavingTarget = false;
        state.targets = action.payload;
      })
      .addCase(resetTarget.rejected, (state, action) => {
        state.isSavingTarget = false;
        state.targetError = action.payload as string;
      });
  },
});

export const { clearMemberDetail, clearTargetError } = performanceSlice.actions;
export default performanceSlice.reducer;
