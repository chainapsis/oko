import type { Pool } from "pg";
import type { Logger } from "winston";
import type { SMTPConfig } from "@oko-wallet/oko-types/admin";
import {
  getInactiveCustomers,
  recordInactiveAppReminder,
} from "@oko-wallet/oko-pg-interface/customers";
import { sendInactiveAppReminderEmail } from "../email/inactive_reminder";

interface InactiveAppReminderRuntimeConfig {
  intervalSeconds: number;
  inactiveThreshold: string; // e.g., '7 days'
  smtpConfig: SMTPConfig;
  fromEmail: string;
}

export function startInactiveAppReminderRuntime(
  db: Pool,
  logger: Logger,
  config: InactiveAppReminderRuntimeConfig,
) {
  logger.info("Starting inactive app reminder runtime...");

  const run = async () => {
    try {
      logger.debug("Checking for inactive apps...");
      const inactiveCustomersRes = await getInactiveCustomers(
        db,
        config.inactiveThreshold,
      );

      if (!inactiveCustomersRes.success) {
        logger.error(
          "Failed to get inactive customers: %s",
          inactiveCustomersRes.err,
        );
        return;
      }

      const customers = inactiveCustomersRes.data;
      if (customers.length === 0) {
        return;
      }

      logger.info("Found %d inactive customers to remind", customers.length);

      for (const customer of customers) {
        try {
          const emailRes = await sendInactiveAppReminderEmail(
            customer.email,
            customer.label,
            config.fromEmail,
            config.smtpConfig,
          );

          if (!emailRes.success) {
            logger.error(
              "Failed to send inactive reminder email to %s: %s",
              customer.email,
              emailRes.error,
            );
            continue;
          }

          const recordRes = await recordInactiveAppReminder(
            db,
            customer.user_id,
          );

          if (!recordRes.success) {
            logger.error(
              "Failed to record inactive reminder for %s: %s",
              customer.user_id,
              recordRes.err,
            );
          } else {
            logger.info(
              "Sent inactive reminder to customer %s (%s, user_id: %s)",
              customer.label,
              customer.customer_id,
              customer.user_id,
            );
          }
        } catch (err) {
          logger.error(
            "Error processing inactive customer %s: %s",
            customer.customer_id,
            err,
          );
        }
      }
    } catch (error) {
      logger.error("Error in inactive app reminder runtime: %s", error);
    }
  };

  // Initial run
  run();

  // Schedule
  setInterval(run, config.intervalSeconds * 1000);
}
