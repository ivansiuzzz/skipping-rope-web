import { useMutation } from "@tanstack/react-query";
import { notificationService } from "../../../../app/components/Notification/notificationService";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../auth-store";
import { registerApi } from "../register-service";
import type { RegisterRequest } from "../register-type";

export const useRegister = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterRequest) => registerApi.register(data),
    onSuccess: (response) => {
      const { user, access_token, refresh_token } = response.data;
      
      // Store token immediately just in case
      try {
        localStorage.setItem("token", access_token);
      } catch (e: unknown) {
        console.error("Failed to set token in localStorage", e);
      }

      // Update store
      login(user, access_token, refresh_token);
      
      notificationService.success("Registration Successful", "Welcome!");
      navigate("/", { replace: true });
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
      const message = error.response?.data?.message || "Please try again later";
      notificationService.error("Registration Failed", message);
    },
  });
};

