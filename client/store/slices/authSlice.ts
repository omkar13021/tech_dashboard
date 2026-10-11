import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { authService } from "@/services/auth.service";
import { setAccessToken } from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "@/types/auth.types";

const initialState: AuthState = {
  user: null,
  accessToken: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Fetch the effective permission set once a token is set (axios attaches it).
async function loadPermissions(): Promise<string[]> {
  try {
    const { permissions } = await authService.getPermissions();
    return permissions ?? [];
  } catch {
    return [];
  }
}

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      setAccessToken(response.accessToken);
      Cookies.set("refreshToken", response.refreshToken, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: 7,
      });
      const permissions = await loadPermissions();
      return { ...response, permissions };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Login failed. Please try again."));
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.register(credentials);
      setAccessToken(response.accessToken);
      Cookies.set("refreshToken", response.refreshToken, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: 7,
      });
      const permissions = await loadPermissions();
      return { ...response, permissions };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Registration failed. Please try again."));
    }
  }
);

/** Re-fetch effective permissions (e.g. after a role/permission change). */
export const refreshPermissions = createAsyncThunk(
  "auth/refreshPermissions",
  async () => {
    return loadPermissions();
  }
);

export const validateUser = createAsyncThunk(
  "auth/validateUser",
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.validateUser();
      return user;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Session validation failed."));
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return { success: true };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Logout failed."));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.permissions = [];
      state.isAuthenticated = false;
      state.error = null;
      setAccessToken(null);
      Cookies.remove("refreshToken");
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.permissions = action.payload.permissions ?? [];
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.permissions = action.payload.permissions ?? [];
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(validateUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(validateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.permissions = action.payload.permissions ?? [];
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(validateUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.permissions = [];
        state.isAuthenticated = false;
      })
      .addCase(refreshPermissions.fulfilled, (state, action) => {
        state.permissions = action.payload ?? [];
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.permissions = [];
        state.isAuthenticated = false;
        state.error = null;
        state.isLoading = false;
        setAccessToken(null);
        Cookies.remove("refreshToken");
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.permissions = [];
        state.isAuthenticated = false;
        state.error = null;
        state.isLoading = false;
        setAccessToken(null);
        Cookies.remove("refreshToken");
      });
  },
});

export const { setCredentials, clearAuth, setError, clearError } =
  authSlice.actions;

export default authSlice.reducer;
