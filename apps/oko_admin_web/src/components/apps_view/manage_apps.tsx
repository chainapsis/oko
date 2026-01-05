"use client";

import { type FC } from "react";

import styles from "./manage_apps.module.scss";
import { AppsViewHeader } from "./apps_view_header";
import { CustomerTable } from "./customer_table";

export const AppsView: FC = () => {
  return (
    <div className={styles.wrapper}>
      <AppsViewHeader />
      <CustomerTable />
    </div>
  );
};
