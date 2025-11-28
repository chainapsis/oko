import { type FC } from "react";
import { Badge } from "@oko-wallet/oko-common-ui/badge";
import { Typography } from "@oko-wallet/oko-common-ui/typography";

import styles from "./user_email_verified_cell.module.scss";

interface UserEmailVerifiedCellProps {
  users: { email: string; is_email_verified: boolean }[];
}

export const UserEmailVerifiedCell: FC<UserEmailVerifiedCellProps> = ({
  users,
}) => {
  if (users.length === 0) {
    return (
      <Typography color="tertiary" size="sm">
        No users
      </Typography>
    );
  }

  return (
    <div className={styles.wrapper}>
      {users.map((user, index) => (
        <div key={index} className={styles.userItem}>
          <Badge
            label={user.is_email_verified ? "Verified" : "Unverified"}
            color={user.is_email_verified ? "success" : "warning"}
            size="sm"
          />
          <Typography color="primary" size="sm" className={styles.email}>
            {user.email}
          </Typography>
        </div>
      ))}
    </div>
  );
};
