import React from "react";

import styles from "./step.module.css";

export const Step: React.FC<StepProps> = ({
  label,
  handleClick,
  result,
  error,
  disabled = false,
}) => {
  return (
    <div className={styles.wrapper}>
      <p className={styles.label}>{label}</p>
      <div className={styles.buttonArea}>
        <button onClick={handleClick} disabled={disabled}>
          Run
        </button>
      </div>
      <div className={styles.resultArea}>
        {error && <div>{error}</div>}
        {result.length > 0 && (
          <div className={styles.result}>
            {result.map((r, idx) => (
              <pre key={idx}>{r}</pre>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export interface StepProps {
  label: string;
  handleClick: () => Promise<void>;
  result: string[];
  error: any;
  disabled?: boolean;
}
