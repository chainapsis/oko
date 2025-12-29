import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

export type Theme = "light" | "dark";
export type ThemePreference = Theme | "system";

interface ThemeState {
  preference: ThemePreference;
  theme: Theme;
}

interface ThemeAction {
  initialize: () => void;
  setPreference: (preference: ThemePreference) => void;
  setTheme: (theme: Theme) => void;
}

const getSystemTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const initialState: ThemeState = {
  preference: "system",
  theme: "light",
};

export const useThemeState = create(
  persist(
    combine<ThemeState, ThemeAction>(initialState, (set, get) => ({
      initialize: () => {
        const { preference } = get();
        const resolvedTheme =
          preference === "system" ? getSystemTheme() : preference;
        set({ theme: resolvedTheme });
      },

      setPreference: (preference: ThemePreference) => {
        const resolvedTheme =
          preference === "system" ? getSystemTheme() : preference;
        set({ preference, theme: resolvedTheme });
      },

      setTheme: (theme: Theme) => {
        set({ theme });
      },
    })),
    {
      name: "theme",
      partialize: (state) => ({ preference: state.preference }),
    },
  ),
);
