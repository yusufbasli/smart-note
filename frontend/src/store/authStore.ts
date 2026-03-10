import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../api/auth";
import type { User } from "../types/api";

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  // Actions
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: true,

  loadToken: async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (token) {
        const user = await authApi.me();
        set({ token, user });
      }
    } catch {
      try { await AsyncStorage.removeItem("access_token"); } catch {}
      set({ token: null, user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (username, password) => {
    const data = await authApi.login({ username, password });
    await AsyncStorage.setItem("access_token", data.access_token);
    const user = await authApi.me();
    set({ token: data.access_token, user });
  },

  register: async (username, email, password) => {
    await authApi.register({ username, email, password });
    // Auto-login after registration
    const data = await authApi.login({ username, password });
    await AsyncStorage.setItem("access_token", data.access_token);
    const user = await authApi.me();
    set({ token: data.access_token, user });
  },

  logout: async () => {
    await AsyncStorage.removeItem("access_token");
    set({ token: null, user: null });
  },
}));
