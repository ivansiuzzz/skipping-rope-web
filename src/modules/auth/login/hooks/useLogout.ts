import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../auth-store";
import { authApi } from "../login-service";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast/headless";

export const useLogout = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout();
      toast.success("logout successful");
      navigate("/login", { replace: true });
    },
    onError: (error: Error) => {
      console.error(error);
      toast.error("logout failed, please try again");
    },
  });
};
