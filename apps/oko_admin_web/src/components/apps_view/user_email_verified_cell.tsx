import { type FC } from "react";
import { Badge } from "@oko-wallet/oko-common-ui/badge";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import type { CustomerDashboardUserWithReminderStatus } from "@oko-wallet/oko-types/ct_dashboard";

import styles from "./user_email_verified_cell.module.scss";

type UserEmailVerifiedCellUser = Pick<
  CustomerDashboardUserWithReminderStatus,
  | "email"
  | "is_email_verified"
  | "has_sent_inactive_reminder"
  | "has_sent_unverified_reminder"
>;

interface UserEmailVerifiedCellProps {
  users: UserEmailVerifiedCellUser[];
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
              <Badge label="Inactive Reminder Sent" color="success" size="sm" />
            )}
            {user.has_sent_unverified_reminder && (
              <Badge
                label="Verification Reminder Sent"
                color="success"
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
