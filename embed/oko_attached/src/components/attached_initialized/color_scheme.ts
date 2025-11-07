import type { Theme } from "@oko-wallet/oko-common-ui/theme";

export function setColorScheme(theme: Theme) {
  const root = window.document.documentElement;

  root.setAttribute("data-theme", theme);
}

export async function determineTheme(
  _hostOrigin: string,
  oldTheme: Theme | null,
): Promise<Theme> {
  // noop
  // fetch ewallet api
  return oldTheme || "dark";
}
