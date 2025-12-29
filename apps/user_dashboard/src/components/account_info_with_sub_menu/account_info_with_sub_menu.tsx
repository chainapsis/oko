import cn from "classnames";
import { LogoutIcon } from "@oko-wallet/oko-common-ui/icons/logout";
import { ThreeDotsVerticalIcon } from "@oko-wallet/oko-common-ui/icons/three_dots_vertical";
import { AnchoredMenu } from "@oko-wallet/oko-common-ui/anchored_menu";
import { Typography } from "@oko-wallet/oko-common-ui/typography";

import styles from "./account_info_with_sub_menu.module.scss";
import { useUserInfoState } from "@oko-wallet-user-dashboard/state/user_info";
import { useSDKState } from "@oko-wallet-user-dashboard/state/sdk";

export const AccountInfoWithSubMenu = () => {
  const okoWallet = useSDKState((state) => state.oko_cosmos)?.okoWallet;

  const name = useUserInfoState((state) => state.name);
  const email = useUserInfoState((state) => state.email);
  const clearUserInfo = useUserInfoState((state) => state.clearUserInfo);

  return (
    <AnchoredMenu
      placement="top-start"
      TriggerComponent={
        <div className={styles.userDetailInfo}>
          <Typography size="sm" color="tertiary" className={styles.userEmail}>
            {name || email}
          </Typography>
          <span className={styles.iconWrapper}>
            <ThreeDotsVerticalIcon color="var(--fg-quaternary)" size={16} />
          </span>
        </div>
      }
      HeaderComponent={
        <div className={cn(styles.menuHeader, styles.userDetailInfo)}>
          <Typography size="sm" color="tertiary" className={styles.userEmail}>
            {name || email}
          </Typography>
        </div>
      }
      menuItems={[
        {
          id: "sign-out",
          label: "Sign Out",
          icon: <LogoutIcon size={16} />,
          onClick: async () => {
            if (!okoWallet) {
              console.error("okoWallet is not initialized");
              return;
            }

            await okoWallet.signOut();
            clearUserInfo();
          },
        },
      ]}
      className={styles.menu}
    />
  );
};
