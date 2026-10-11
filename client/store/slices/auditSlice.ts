import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  auditApi,
  AuditLogEntry,
  AuditQueryParams,
} from '@/services/audit.service';
import { getApiErrorMessage } from '@/lib/apiError';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AuditState {
  logs: AuditLogEntry[];
  selected: AuditLogEntry | null;
  meta: PaginationMeta;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuditState = {
  logs: [],
  selected: null,
  meta: { total: 0, page: 1, limit: 25, totalPages: 1 },
  isLoading: false,
  error: null,
};

export const queryAudit = createAsyncThunk(
  'audit/query',
  async (params: AuditQueryParams, { rejectWithValue }) => {
    try {
      return await auditApi.query(params);
    } catch (e) {
      return rejectWithValue(getApiErrorMessage(e, 'Failed to load audit logs'));
    }
  },
);

export const fetchAuditEntry = createAsyncThunk(
  'audit/getById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await auditApi.getById(id);
    } catch (e) {
      return rejectWithValue(getApiErrorMessage(e, 'Failed to load audit entry'));
    }
  },
);

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    clearSelectedAudit: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(queryAudit.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(queryAudit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.logs = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(queryAudit.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAuditEntry.fulfilled, (state, action) => {
        state.selected = action.payload;
      });
  },
});

export const { clearSelectedAudit } = auditSlice.actions;
export default auditSlice.reducer;
