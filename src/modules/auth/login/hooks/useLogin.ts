import { useMutation } from "@tanstack/react-query";
import { notificationService } from "../../../../app/components/Notification/notificationService";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../auth-store";
import { authApi } from "../login-service";
import type { LoginRequest } from "../login-type";

export const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data;
      try {
        localStorage.setItem("token", accessToken);
      } catch (e: unknown) {
        console.error("Failed to set token in localStorage", e);
      }
      login(user, accessToken, refreshToken);
      navigate("/", { replace: true });
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      notificationService.error("登入失敗", "請稍後再試或確認帳密");
    },
  });
};
