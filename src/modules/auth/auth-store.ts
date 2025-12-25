import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "./auth-type";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      login: (user, accessToken, refreshToken) => {
        try {
          if (accessToken) localStorage.setItem("token", accessToken);
        } catch (e: unknown) {
          console.error("Failed to set token in localStorage", e);
        }
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        try {
          localStorage.removeItem("token");
        } catch (e: unknown) {
          console.error("Failed to remove token from localStorage", e);
        }
        set(initialState);
      },

      setTokens: (accessToken, refreshToken) => {
        try {
          if (accessToken) localStorage.setItem("token", accessToken);
          else localStorage.removeItem("token");
        } catch (e: unknown) {
          console.error("Failed to set token in localStorage", e);
        }
        set({ accessToken, refreshToken });
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
