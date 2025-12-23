// src/api/client.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { notificationService } from "../components/Notification/notificationService";

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
          notificationService.error("請重新登入", "請重新登入以繼續使用");
          localStorage.removeItem("token");
          window.location.href = "/login";
          break;
        case 403:
          notificationService.error("沒有權限", "您沒有此操作的權限");
          break;
        case 404:
          notificationService.error("找不到資源", "請稍後再試或聯絡管理員");
          break;
        case 500:
          notificationService.error("伺服器錯誤", "請稍後再試或聯絡管理員");
          break;
        default:
          notificationService.error(
            "錯誤",
            error.response.data?.message || "發生了錯誤"
          );
      }
    } else if (error.request) {
      notificationService.error("網路錯誤", "請檢查您的網路連線");
    }
    return Promise.reject(error);
  }
);
