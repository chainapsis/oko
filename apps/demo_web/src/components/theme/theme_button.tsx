import { Button } from "@oko-wallet/oko-common-ui/button";
import { SunIcon } from "@oko-wallet/oko-common-ui/icons/sun_icon";
import { MoonIcon } from "@oko-wallet/oko-common-ui/icons/moon_icon";

import { useThemeState } from "@oko-wallet-demo-web/state/theme";
import styles from "./theme_button.module.scss";

export const ThemeButton = () => {
  const theme = useThemeState((state) => state.theme);
  const setPreference = useThemeState((state) => state.setPreference);

  const handleThemeToggle = () => {
    setPreference(theme === "light" ? "dark" : "light");
  };

  return (
    // Wrap with a wrapper div to increase CSS Cascading Specificity
    <div className={styles.themeButtonContainer}>
      <Button
        size="md"
        variant="secondary"
        className={styles.themeButton}
        onClick={handleThemeToggle}
      >
        {theme === "light" ? (
          <SunIcon color="var(--fg-quaternary)" size={20} />
        ) : (
          <MoonIcon color="var(--fg-quaternary)" size={20} />
        )}
      </Button>
    </div>
  );
};
