"use client";

import React from "react";
import styles from "./preview_panel.module.scss";

export const PreviewPanel: React.FC = () => {
  return (
    <div className={styles.wrapper}>
      <div
        className={styles.inner}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "var(--fg-primary)",
          }}
        >
          Under maintenance
        </div>
        <div
          style={{
            marginTop: "10px",
            color: "var(--fg-secondary)",
          }}
        >
          The service will be back online soon.
        </div>
      </div>
    </div>
  );
};
