import type { FC, ReactNode } from "react";

import styles from "./make_sig_modal_code_block_container.module.scss";

export interface MakeSignatureRawCodeBlockContainerProps {
  children: ReactNode;
}

export const MakeSignatureRawCodeBlockContainer: FC<
  MakeSignatureRawCodeBlockContainerProps
> = ({ children }) => {
  return <div className={styles.codeBlockContainer}>{children}</div>;
};
