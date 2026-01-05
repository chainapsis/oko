import { type FC, type PropsWithChildren } from "react";
import cn from "classnames";

import styles from "./widget_components.module.scss";

export const Widget: FC<
  PropsWithChildren<{
    gradientBorder?: boolean;
  }>
> = ({ children, gradientBorder = false }) => {
  return (
    <div className={cn(styles.widget, gradientBorder && styles.gradientBorder)}>
      {children}
    </div>
  );
};
