import { create } from "zustand";
import { TokenResponse, UserSummary } from "./types";

interface AuthState {
  user: UserSummary | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (tokenResponse: TokenResponse) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (tokenResponse) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ventura_access_token", tokenResponse.accessToken);
      localStorage.setItem("ventura_refresh_token", tokenResponse.refreshToken);
      localStorage.setItem("ventura_user", JSON.stringify(tokenResponse.user));
    }
    set({
      user: tokenResponse.user,
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ventura_access_token");
      localStorage.removeItem("ventura_refresh_token");
      localStorage.removeItem("ventura_user");
    }
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  initialize: () => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("ventura_access_token");
      const refreshToken = localStorage.getItem("ventura_refresh_token");
      const userStr = localStorage.getItem("ventura_user");
      if (accessToken && userStr) {
        try {
          const user = JSON.parse(userStr) as UserSummary;
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        } catch {
          // parse fallback
        }
      }
    }
    set({ isLoading: false });
  },
}));
