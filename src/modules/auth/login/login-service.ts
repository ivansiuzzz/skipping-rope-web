import { apiClient } from "../../../app/api/client";
import type { ApiResponse } from "../../../app/types/api-type";
import type { LoginRequest, LoginResponse } from "./login-type";

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>("/auth/login", data),

  logout: () => apiClient.post<ApiResponse<void>>("/auth/logout"),
};
