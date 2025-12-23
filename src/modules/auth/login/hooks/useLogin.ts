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
      login(user, accessToken, refreshToken);
      notificationService.success("登入成功", "歡迎回來！");
      navigate("/", { replace: true });
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      notificationService.error("登入失敗", "請稍後再試或確認帳密");
    },
  });
};
