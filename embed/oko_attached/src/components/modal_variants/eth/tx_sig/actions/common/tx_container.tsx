import React from "react";

import styles from "./tx_container.module.scss";

export interface TxContainerProps {
  children: React.ReactNode;
}

export const TxContainer: React.FC<TxContainerProps> = ({ children }) => {
  return <div className={styles.txContainer}>{children}</div>;
};
