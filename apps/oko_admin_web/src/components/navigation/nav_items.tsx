import React from "react";
import { HomeOutlinedIcon } from "@oko-wallet/oko-common-ui/icons/home_outlined";
import { ChartOutlinedIcon } from "@oko-wallet/oko-common-ui/icons/chart_outlined";
import { UsersIcon } from "@oko-wallet/oko-common-ui/icons/users";

import { paths } from "@oko-wallet-admin/paths";
import { Navigation, type NavigationItem } from "./navigation";
import styles from "./navigation.module.scss";

export const navigationItems: NavigationItem[] = [
  {
    label: "Manage Apps",
    route: "apps-menu",
    icon: <HomeOutlinedIcon color="var(--gray-400)" className={styles.icon} />,
    subItems: [
      { label: "App List", route: paths.apps },
      { label: "Register New App", route: paths.apps_create },
    ],
  },
  {
    label: "Manage Users",
    route: paths.user_list,
    icon: <UsersIcon color="var(--gray-400)" className={styles.icon} />,
  },
  {
    label: "Sig Shares",
    route: "sig-shares-menu",
    icon: <ChartOutlinedIcon color="var(--gray-400)" className={styles.icon} />,
    subItems: [{ label: "Sig History", route: paths.sig_shares }],
  },
  {
    label: "Key Share Nodes",
    route: "key-share-nodes",
    icon: <ChartOutlinedIcon color="var(--gray-400)" className={styles.icon} />,
    subItems: [
      {
        label: "KeyShare Nodes",
        route: paths.ks_nodes,
      },
      {
        label: "Add New Node",
        route: paths.ks_nodes_create,
      },
    ],
  },
];
