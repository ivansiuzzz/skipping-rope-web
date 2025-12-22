import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
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
      toast.success("login successful");
      navigate("/", { replace: true });
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast.error("login failed");
    },
  });
};
