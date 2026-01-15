import type { ReactNode } from "react";

import { SideBar } from "@oko-wallet-admin/components/side_bar/side_bar";
import styles from "@oko-wallet-admin/styles/layout_with_side_bar.module.scss";

export default function AppsLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.wrapper}>
      <SideBar />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
