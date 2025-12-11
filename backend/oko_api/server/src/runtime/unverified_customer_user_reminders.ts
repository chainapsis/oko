import type { Pool } from "pg";
import type { Logger } from "winston";
import type { SMTPConfig } from "@oko-wallet/oko-types/admin";
import {
  getUnverifiedCustomerDashboardUsers,
  updateCustomerDashboardUserPassword,
} from "@oko-wallet/oko-pg-interface/customer_dashboard_users";
import { insertEmailSentLog } from "@oko-wallet/oko-pg-interface/email_sent_logs";
import { hashPassword } from "@oko-wallet/crypto-js";
import { generatePassword } from "@oko-wallet/admin-api/utils/password";
import { sendUnverifiedUserReminderEmail } from "@oko-wallet/ct-dashboard-api/src/email/unverified_reminder";

export interface UnverifiedCustomerUserReminderRuntimeConfig {
  intervalSeconds: number;
  unverifiedThreshold: string; // e.g., '7 days'
  smtpConfig: SMTPConfig;
  fromEmail: string;
}

export function startUnverifiedCustomerUserReminderRuntime(
  db: Pool,
  logger: Logger,
  config: UnverifiedCustomerUserReminderRuntimeConfig,
) {
  logger.info("Starting unverified customer user reminder runtime...");

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

          // Send email first (outside transaction to avoid holding DB connection)
          const emailRes = await sendUnverifiedUserReminderEmail(
            user.user.email,
            user.label,
            temporaryPassword,
            config.fromEmail,
            config.smtpConfig,
          );

          if (!emailRes.success) {
            logger.error(
              "Failed to send unverified reminder email to %s: %s",
              user.user.email,
              emailRes.error,
            );
            continue;
          }

          // Start transaction after email is sent successfully
          const client = await db.connect();
          try {
            await client.query("BEGIN");

            // Hash the password
            const passwordHash = await hashPassword(temporaryPassword);

            // Update user password in DB
            const updateRes = await updateCustomerDashboardUserPassword(
              client,
              {
                user_id: user.user.user_id,
                password_hash: passwordHash,
              },
            );

            if (!updateRes.success) {
              throw new Error(updateRes.err);
            }

            // Record email sent log
            const recordRes = await insertEmailSentLog(client, {
              target_id: user.user.user_id,
              type: "UNVERIFIED_CUSTOMER_USER",
              email: user.user.email,
            });

            if (!recordRes.success) {
              throw new Error(recordRes.err);
            }

            await client.query("COMMIT");

            logger.info(
              "Sent unverified reminder to user %s (%s)",
              user.user.email,
              user.user.user_id,
            );
          } catch (err) {
            await client.query("ROLLBACK");
            logger.error(
              "Error processing unverified user %s: %s",
              user.customer_id,
              err,
            );
          } finally {
            client.release();
          }
        } catch (err) {
          logger.error(
            "Error processing unverified user %s: %s",
            user.customer_id,
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
