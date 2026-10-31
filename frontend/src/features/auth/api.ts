import { apiClient } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import { LoginPayload, TokenResponse, UserSummary } from "./types";

export async function loginApi(payload: LoginPayload): Promise<TokenResponse> {
  const response = await apiClient.post<ApiResponse<TokenResponse>>("/auth/login", payload);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message ?? "Authentication failed");
  }
  return response.data.data;
}

export async function getMeApi(): Promise<UserSummary> {
  const response = await apiClient.get<ApiResponse<UserSummary>>("/auth/me");
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message ?? "Failed to fetch user profile");
  }
  return response.data.data;
}

export async function logoutApi(refreshToken?: string): Promise<void> {
  await apiClient.post("/auth/logout", { refreshToken }).catch(() => null);
}
