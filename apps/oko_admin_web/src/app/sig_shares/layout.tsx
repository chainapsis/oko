import type { ReactNode } from "react";

import styles from "@oko-wallet-admin/styles/layout_with_side_bar.module.scss";
import { SideBar } from "@oko-wallet-admin/components/side_bar/side_bar";

export default function SigSharesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className={styles.wrapper}>
      <SideBar />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
