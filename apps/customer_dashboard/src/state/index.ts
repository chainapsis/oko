import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

import { AppState, AppActions, AppUser } from "./types";

const STORAGE_KEY = "oko_wallet";

export const useAppState = create(
  persist(
    combine<AppState, AppActions>(
      {
        user: null,
        token: null,
      },
      (set) => {
        return {
          setUser: (user: AppUser) => {
            set({ user });
          },
          resetUser: () => {
            set({ user: null });
          },
          setToken: (token: string) => {
            set({ token });
          },
          resetToken: () => {
            set({ token: null });
          },
        };
      },
    ),
    { name: STORAGE_KEY },
  ),
);
