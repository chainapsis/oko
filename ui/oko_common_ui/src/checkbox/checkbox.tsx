import React from "react";
import cn from "classnames";

import styles from "./checkbox.module.scss";
import { CheckIcon } from "./check_icon";
import {
  Typography,
  type BaseTypographyProps,
} from "@oko-wallet-common-ui/typography/typography";

interface CheckboxProps {
  id: string;
  size?: "sm" | "md";
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  labelStyle?: {
    color?: BaseTypographyProps["color"];
    size?: BaseTypographyProps["size"];
    weight?: BaseTypographyProps["weight"];
  };
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  size = "md",
  checked,
  onChange,
  label,
  labelStyle,
}) => {
  const iconSize = size === "sm" ? 12 : 14;
  const checkBoxInputStyle = cn(
    styles.checkboxInput,
    styles[`checkboxInput-${size}`],
    checked ? styles.checkboxInputChecked : styles.checkboxInputUnChecked,
  );
  const checkboxContainerStyle = cn(
    styles.checkboxContainer,
    styles[`checkboxContainer-${size}`],
  );

  return (
    <div className={styles.checkboxControl}>
      <input
        type="checkbox"
        id={id}
        className={styles.checkboxHidden}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label htmlFor={id} className={checkboxContainerStyle}>
        <div className={styles.checkboxInputContainer}>
          <span className={checkBoxInputStyle}>
            {/* NOTE: For animate processing, it adjust the display by adjusting the opacity of the corresponding icon in the css @retto*/}
            <CheckIcon size={iconSize} />
          </span>
        </div>
        <Typography
          size={labelStyle?.size ?? "sm"}
          weight={labelStyle?.weight ?? "medium"}
          color={labelStyle?.color ?? "secondary"}
        >
          {label}
        </Typography>
      </label>
    </div>
  );
};
