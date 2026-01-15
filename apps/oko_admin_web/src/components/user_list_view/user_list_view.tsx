import type { FC } from "react";

import { TitleHeader } from "@oko-wallet-admin/components/title_header/title_header";

import { UserListTable } from "./user_list_table";

import styles from "./user_list_view.module.scss";

export const UserListView: FC = () => {
  return (
    <div className={styles.wrapper}>
      <TitleHeader title="Manage Users" />
      <UserListTable />
    </div>
  );
};
