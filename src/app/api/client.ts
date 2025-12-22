// src/api/client.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          toast.error("Please log in again");
          localStorage.removeItem("token");
          window.location.href = "/login";
          break;
        case 403:
          toast.error("No permission");
          break;
        case 404:
          toast.error("Resource not found");
          break;
        case 500:
          toast.error("Server error");
          break;
        default:
          toast.error(error.response.data?.message || "An error occurred");
      }
    } else if (error.request) {
      toast.error("Network error, please check your connection");
    }
    return Promise.reject(error);
  }
);
