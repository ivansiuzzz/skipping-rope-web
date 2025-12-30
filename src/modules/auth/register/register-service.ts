import { apiClient } from "../../../app/api/client";
import type { RegisterRequest, RegisterResponse } from "./register-type";

export const registerApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<RegisterResponse>("/auth/register", data),
};

