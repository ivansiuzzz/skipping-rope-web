import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../auth-store";
import { authApi } from "../login-service";
import { useMutation } from "@tanstack/react-query";
import { notificationService } from "../../../../app/components/Notification/notificationService";

export const useLogout = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout();
      notificationService.success("登出成功", "您已安全登出");
      navigate("/login", { replace: true });
    },
    onError: (error: Error) => {
      console.error(error);
      notificationService.error("登出失敗", "請稍後再試");
    },
  });
};
