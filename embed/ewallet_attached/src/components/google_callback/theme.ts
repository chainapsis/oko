import type { Theme } from "@oko-wallet/ewallet-common-ui/theme";

export function getSystemTheme(): Theme {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  if (prefersDark.matches) {
    return "dark";
  } else {
    return "light";
  }
}
