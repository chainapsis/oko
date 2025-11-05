import React from "react";
import { Button } from "@oko-wallet/ewallet-common-ui/button";

import styles from "./empty_state.module.scss";

interface EmptyStateProps {
  text: string;
  showButton?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  text,
  showButton = false,
  buttonText,
  onButtonClick,
}: EmptyStateProps) => {
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    }
  };

  return (
    <div className={styles.wrapper}>
      <p className={styles.text}>{text}</p>
      {showButton && (
        <Button size="lg" onClick={handleButtonClick}>
          {buttonText}
        </Button>
      )}
    </div>
  );
};
