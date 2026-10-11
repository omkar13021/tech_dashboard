import axiosInstance from "@/lib/axios";
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  RefreshTokenResponse,
  MeResponse,
} from "@/types/auth.types";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { confirmPassword, ...registerData } = credentials;
    const response = await axiosInstance.post<AuthResponse>(
      "/auth/register",
      registerData
    );
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await axiosInstance.post<RefreshTokenResponse>(
      "/auth/refresh",
      { refreshToken }
    );
    return response.data;
  },

  async logout(): Promise<void> {
    await axiosInstance.post("/auth/logout");
  },

  async validateUser(): Promise<MeResponse> {
    const response = await axiosInstance.get<MeResponse>("/auth/me");
    return response.data;
  },

  async getPermissions(): Promise<{ permissions: string[] }> {
    const response = await axiosInstance.get<{ permissions: string[] }>(
      "/auth/permissions"
    );
    return response.data;
  },
};
