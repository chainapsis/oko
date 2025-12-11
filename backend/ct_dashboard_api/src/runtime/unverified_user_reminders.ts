import type { Pool } from "pg";
import type { Logger } from "winston";
import type { SMTPConfig } from "@oko-wallet/oko-types/admin";
import {
  getUnverifiedCustomerDashboardUsers,
  recordUnverifiedUserReminder,
  updateCustomerDashboardUserPassword,
} from "@oko-wallet/oko-pg-interface/customer_dashboard_users";
import { sendUnverifiedUserReminderEmail } from "../email/unverified_reminder";
import { hashPassword } from "@oko-wallet/crypto-js";
import { generatePassword } from "@oko-wallet/admin-api/utils/password";

interface UnverifiedUserReminderRuntimeConfig {
  intervalSeconds: number;
  unverifiedThreshold: string; // e.g., '7 days'
  smtpConfig: SMTPConfig;
  fromEmail: string;
}

export function startUnverifiedUserReminderRuntime(
  db: Pool,
  logger: Logger,
  config: UnverifiedUserReminderRuntimeConfig,
) {
  logger.info("Starting unverified user reminder runtime...");

  const run = async () => {
    try {
      logger.debug("Checking for unverified users...");
      const unverifiedUsersRes = await getUnverifiedCustomerDashboardUsers(
        db,
        config.unverifiedThreshold,
      );

      if (!unverifiedUsersRes.success) {
        logger.error(
          "Failed to get unverified users: %s",
          unverifiedUsersRes.err,
        );
        return;
      }

      const users = unverifiedUsersRes.data;
      if (users.length === 0) {
        return;
      }

      logger.info("Found %d unverified users to remind", users.length);

      for (const user of users) {
        try {
          // Generate new temporary password
          const temporaryPassword = generatePassword();

          // Hash the password
          const passwordHash = await hashPassword(temporaryPassword);

          // Update user password in DB
          const updateRes = await updateCustomerDashboardUserPassword(db, {
            user_id: user.user_id,
            password_hash: passwordHash,
          });

          if (!updateRes.success) {
            logger.error(
              "Failed to update temporary password for user %s: %s",
              user.user_id,
              updateRes.err,
            );
            continue;
          }

          const emailRes = await sendUnverifiedUserReminderEmail(
            user.email,
            user.customer_name,
            temporaryPassword,
            config.fromEmail,
            config.smtpConfig,
          );

          if (!emailRes.success) {
            logger.error(
              "Failed to send unverified reminder email to %s: %s",
              user.email,
              emailRes.error,
            );
            continue;
          }

          const recordRes = await recordUnverifiedUserReminder(
            db,
            user.user_id,
          );

          if (!recordRes.success) {
            logger.error(
              "Failed to record unverified reminder for user %s: %s",
              user.user_id,
              recordRes.err,
            );
          } else {
            logger.info(
              "Sent unverified reminder to user %s (%s)",
              user.email,
              user.user_id,
            );
          }
        } catch (err) {
          logger.error(
            "Error processing unverified user %s: %s",
            user.user_id,
            err,
          );
        }
      }
    } catch (error) {
      logger.error("Error in unverified user reminder runtime: %s", error);
    }
  };

  // Initial run
  run();

  // Schedule
  setInterval(run, config.intervalSeconds * 1000);
}
