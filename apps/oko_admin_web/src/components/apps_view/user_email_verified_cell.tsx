import { type FC } from "react";
import { Badge } from "@oko-wallet/oko-common-ui/badge";
import { Typography } from "@oko-wallet/oko-common-ui/typography";

import styles from "./user_email_verified_cell.module.scss";

interface UserEmailVerifiedCellProps {
  users: {
    email: string;
    is_email_verified: boolean;
    has_sent_inactive_reminder?: boolean;
    has_sent_unverified_reminder?: boolean;
  }[];
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
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            <Badge
              label={user.is_email_verified ? "Verified" : "Unverified"}
              color={user.is_email_verified ? "success" : "warning"}
              size="sm"
            />
            {user.has_sent_inactive_reminder && (
              <Badge label="Inactive Reminder Sent" color="warning" size="sm" />
            )}
            {user.has_sent_unverified_reminder && (
              <Badge
                label="Verification Reminder Sent"
                color="warning"
                size="sm"
              />
            )}
          </div>
          <Typography color="primary" size="sm" className={styles.email}>
            {user.email}
          </Typography>
        </div>
      ))}
    </div>
  );
};
