"use client";

import { createContext, type FC, type PropsWithChildren } from "react";

export type Theme = "light" | "dark" | "system";

export const ThemeContext = createContext<Theme>("system");

export const ThemeProvider: FC<PropsWithChildren<ThemeProviderProps>> = ({
  children,
  theme,
}) => {
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export interface ThemeProviderProps {
  theme: Theme;
}
