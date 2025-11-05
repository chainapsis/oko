import type { Pool } from "pg";
import type { Logger } from "winston";
import { processKSNodeHealthChecks } from "@oko-wallet/ks-node-health";

import { getSecondsFromNow, sleep } from "@oko-wallet-api/utils";

export interface KSNodeHealthCheckRuntimeOptions {
  intervalSeconds: number;
}

export async function startKSNodeHealthCheckRuntime(
  pool: Pool,
  logger: Logger,
  options: KSNodeHealthCheckRuntimeOptions,
) {
  logger.info(
    "Starting KS node health check runtime with interval %d seconds",
    options.intervalSeconds,
  );

  while (true) {
    try {
      const start = Date.now();

      const processKSNodeHealthChecksRes =
        await processKSNodeHealthChecks(pool);
      const duration = getSecondsFromNow(start);

      if (processKSNodeHealthChecksRes.success === false) {
        logger.error(
          "Failed to process KS node health checks: %s, duration: %d seconds",
          processKSNodeHealthChecksRes.err,
          duration,
        );
      } else {
        logger.info(
          "Processed %d KS node health checks, duration: %d seconds",
          processKSNodeHealthChecksRes.data,
          duration,
        );
      }
    } catch (err) {
      logger.error("Error running KS node health check, err: %s", err);
    } finally {
      await sleep(options.intervalSeconds * 1000);
    }
  }
}
