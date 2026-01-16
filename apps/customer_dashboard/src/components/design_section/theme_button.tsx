import { type CustomerTheme } from "@oko-wallet/oko-types/customers";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { CheckIcon } from "@oko-wallet/oko-common-ui/icons/check_icon";

import styles from "./theme_button.module.scss";

const LightTheme = () => {
  return (
    <div className={styles.lightThemeButton}>
      <div className={styles.lightThemeButtonInner}>
        <Typography
          className={styles.lightThemeButtonInnerText}
          size="sm"
          weight="semibold"
          color="primary"
        >
          Aa
        </Typography>
      </div>
    </div>
  );
};

const DarkTheme = () => {
  return (
    <div className={styles.darkThemeButton}>
      <div className={styles.darkThemeButtonInner}>
        <Typography
          className={styles.darkThemeButtonInnerText}
          size="sm"
          weight="semibold"
        >
          Aa
        </Typography>
      </div>
    </div>
  );
};

const SystemThemeButton = () => {
  return (
    <div className={styles.systemThemeButtonContainer}>
      <div className={styles.lightThemeButton}>
        <div className={styles.lightThemeButtonInner}>
          <Typography
            className={styles.lightThemeButtonInnerText}
            size="sm"
            weight="semibold"
            color="primary"
          >
            Aa
          </Typography>
        </div>
      </div>

      <div className={styles.darkThemeButton}>
        <div className={styles.darkThemeButtonInner}>
          <Typography
            className={styles.darkThemeButtonInnerText}
            size="sm"
            weight="semibold"
          >
            Aa
          </Typography>
        </div>
      </div>
    </div>
  );
};

interface ThemeButtonProps {
  theme: CustomerTheme;
  onClick: () => void;
  active: boolean;
  label: string;
}
export const ThemeButton = ({
  theme,
  onClick,
  active,
  label,
}: ThemeButtonProps) => {
  const themeButton = (() => {
    switch (theme) {
      case "light":
        return <LightTheme />;
      case "dark":
        return <DarkTheme />;
      case "system":
        return <SystemThemeButton />;
    }
  })();

  return (
    <div className={styles.buttonContainer}>
      <button
        className={`${styles.button} ${active ? styles.active : ""}`}
        onClick={onClick}
      >
        {themeButton}
        {active && (
          <div className={styles.activeIndicator}>
            <CheckIcon size={12} />
          </div>
        )}
      </button>

      <Typography size="sm" weight="medium" color="secondary">
        {label}
      </Typography>
    </div>
  );
};
