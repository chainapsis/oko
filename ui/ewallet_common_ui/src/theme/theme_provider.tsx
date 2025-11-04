"use client";

import React, { createContext, type PropsWithChildren } from "react";

export type Theme = "light" | "dark";

export const ThemeContext = createContext<Theme>("dark");

export const ThemeProvider: React.FC<PropsWithChildren<ThemeProviderProps>> = ({
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
