import type { Pool } from "pg";
import type { Logger } from "winston";
import type { SMTPConfig } from "@oko-wallet/oko-types/admin";
import { getInactiveCustomerDashboardUsers } from "@oko-wallet/oko-pg-interface/customer_dashboard_users";
import { insertEmailSentLog } from "@oko-wallet/oko-pg-interface/email_sent_logs";
import { sendInactiveAppReminderEmail } from "@oko-wallet/ct-dashboard-api/src/email/inactive_reminder";

export interface InactiveCustomerUserReminderRuntimeConfig {
  intervalSeconds: number;
  inactiveThreshold: string; // e.g., '7 days'
  smtpConfig: SMTPConfig;
  fromEmail: string;
}

export function startInactiveCustomerUserReminderRuntime(
  db: Pool,
  logger: Logger,
  config: InactiveCustomerUserReminderRuntimeConfig,
) {
  logger.info("Starting inactive customer user reminder runtime...");

  const run = async () => {
    try {
      logger.debug("Checking for inactive apps...");
      const inactiveCustomerDashboardUsersRes =
        await getInactiveCustomerDashboardUsers(db, config.inactiveThreshold);

      if (!inactiveCustomerDashboardUsersRes.success) {
        logger.error(
          "Failed to get inactive customer users: %s",
          inactiveCustomerDashboardUsersRes.err,
        );
        return;
      }

      const customerDashboardUsers = inactiveCustomerDashboardUsersRes.data;
      if (customerDashboardUsers.length === 0) {
        return;
      }

      logger.info(
        "Found %d inactive customer users to remind",
        customerDashboardUsers.length,
      );

      for (const customerDashboardUser of customerDashboardUsers) {
        try {
          const emailRes = await sendInactiveAppReminderEmail(
            customerDashboardUser.user.email,
            customerDashboardUser.label,
            config.fromEmail,
            config.smtpConfig,
          );

          if (!emailRes.success) {
            logger.error(
              "Failed to send inactive reminder email to %s: %s",
              customerDashboardUser.user.email,
              emailRes.error,
            );
            continue;
          }

          const recordRes = await insertEmailSentLog(db, {
            target_id: customerDashboardUser.user.user_id,
            type: "INACTIVE_CUSTOMER_USER",
            email: customerDashboardUser.user.email,
          });

          if (!recordRes.success) {
            logger.error(
              "Failed to insert email sent log for %s: %s",
              customerDashboardUser.user.user_id,
              recordRes.err,
            );
          } else {
            logger.info(
              "Sent inactive reminder to customer user %s (%s, user_id: %s)",
              customerDashboardUser.label,
              customerDashboardUser.customer_id,
              customerDashboardUser.user.user_id,
            );
          }
        } catch (err) {
          logger.error(
            "Error processing inactive customer user %s: %s",
            customerDashboardUser.customer_id,
            err,
          );
        }
      }
    } catch (error) {
      logger.error(
        "Error in inactive customer user reminder runtime: %s",
        error,
      );
    }
  };

  // Initial run
  run();

  // Schedule
  setInterval(run, config.intervalSeconds * 1000);
}
