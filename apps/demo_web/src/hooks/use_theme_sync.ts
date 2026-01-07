import { useEffect, useLayoutEffect } from "react";
import { useThemeState } from "@oko-wallet-demo-web/state/theme";

export const useThemeSync = () => {
  const { preference, theme, initialize, setTheme } = useThemeState();

  useLayoutEffect(() => {
    initialize();
  }, [initialize]);

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (preference !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [preference, setTheme]);
};
