import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  assistantApi,
  AssistantListItem,
  AssistantDetail,
  AssistantQueryParams,
  AssistantActionRequest,
  AssistantActionResult,
} from '@/services/assistant.service';
import { getApiErrorMessage } from '@/lib/apiError';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AssistantsState {
  assistants: AssistantListItem[];
  selectedAssistant: AssistantDetail | null;
  meta: PaginationMeta;
  isLoading: boolean;
  isLoadingDetail: boolean;
  isMutating: boolean;
  error: string | null;
}

const initialState: AssistantsState = {
  assistants: [],
  selectedAssistant: null,
  meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
  isLoading: false,
  isLoadingDetail: false,
  isMutating: false,
  error: null,
};

type QueryAssistantsResult =
  | { mode: 'list'; assistants: AssistantListItem[]; meta: PaginationMeta }
  | { mode: 'detail'; assistant: AssistantDetail };

export const queryAssistants = createAsyncThunk<QueryAssistantsResult, AssistantQueryParams>(
  'assistants/query',
  async (params, { rejectWithValue }) => {
    try {
      if (params.assistantId) {
        const assistant = await assistantApi.queryOne(params.assistantId);
        return { mode: 'detail', assistant };
      }
      const res = await assistantApi.query(params);
      return { mode: 'list', assistants: res.data, meta: res.meta };
    } catch (e) {
      return rejectWithValue(getApiErrorMessage(e, 'Failed to load assistants'));
    }
  },
);

export const executeAssistantAction = createAsyncThunk<
  AssistantActionResult,
  AssistantActionRequest
>('assistants/action', async (request, { rejectWithValue }) => {
  try {
    return await assistantApi.action(request);
  } catch (e) {
    return rejectWithValue(getApiErrorMessage(e, 'Action failed'));
  }
});

const assistantSlice = createSlice({
  name: 'assistants',
  initialState,
  reducers: {
    clearSelectedAssistant: (state) => {
      state.selectedAssistant = null;
    },
    clearAssistantsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(queryAssistants.pending, (state, action) => {
        if (action.meta.arg.assistantId) state.isLoadingDetail = true;
        else state.isLoading = true;
        state.error = null;
      })
      .addCase(queryAssistants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingDetail = false;
        if (action.payload.mode === 'detail') {
          state.selectedAssistant = action.payload.assistant;
        } else {
          state.assistants = action.payload.assistants;
          state.meta = action.payload.meta;
        }
      })
      .addCase(queryAssistants.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingDetail = false;
        state.error = action.payload as string;
      })
      .addCase(executeAssistantAction.pending, (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addCase(executeAssistantAction.fulfilled, (state) => {
        state.isMutating = false;
      })
      .addCase(executeAssistantAction.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedAssistant, clearAssistantsError } = assistantSlice.actions;
export default assistantSlice.reducer;
