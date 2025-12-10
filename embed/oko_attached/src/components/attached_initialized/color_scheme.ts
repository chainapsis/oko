import type { Theme } from "@oko-wallet/oko-common-ui/theme";

export function setColorScheme(theme: Theme) {
  const root = window.document.documentElement;

  root.setAttribute("data-theme", theme);

  // Set color-scheme to support both light and dark
  // Browser will automatically match parent dApp's color-scheme
  // This prevents browser from adding opaque background

  // NOTE - Applying a color-scheme to the body of an iframe causes a bug where,
  // if the host site doesn't have a color-scheme and the browser's default is dark,
  // the background changes to black.
  // Therefore, we force a light mode in the iframe(in sdk_core not here) @retto
  // root.style.colorScheme = "light dark";
}

export async function determineTheme(
  _hostOrigin: string,
  oldTheme: Theme | null,
): Promise<Theme> {
  // noop
  // fetch Oko api
  return oldTheme || "dark";
}
