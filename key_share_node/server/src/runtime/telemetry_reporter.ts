import type { Pool } from "pg";

import { countKeyShares } from "@oko-wallet/ksn-pg-interface";
import { logger } from "@oko-wallet-ksn-server/logger";

export async function startTelemetryReporterRuntime(
  db: Pool,
  publicKey: string,
  okoApiBaseUrl: string,
  reportPassword: string,
  intervalSeconds: number,
) {
  logger.info(
    "Starting Telemetry Reporter Runtime, interval: %ds",
    intervalSeconds,
  );

  const run = async () => {
    try {
      await reportTelemetry(db, publicKey, okoApiBaseUrl, reportPassword);
    } catch (err) {
      logger.error("Telemetry reporter runtime error: %s", err);
    }
  };

  // Initial run
  run();

  setInterval(run, intervalSeconds * 1000);
}

async function reportTelemetry(
  db: Pool,
  publicKey: string,
  baseUrl: string,
  password: string,
) {
  // 1. Count Key Shares
  const countRes = await countKeyShares(db);
  const keyShareCount = countRes.success ? countRes.data : -1;
  const payload = {
    db_status: countRes.success ? "OK" : "ERROR",
    error_msg: countRes.success ? null : countRes.err,
  };

  // 2. Send Report
  const url = `${baseUrl}/tss/v1/ks_node/telemetry`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-KS-NODE-PASSWORD": password,
      },
      body: JSON.stringify({
        public_key: publicKey,
        key_share_count: keyShareCount,
        payload: payload,
      }),
    });

    if (!response.ok) {
      logger.error(
        "Failed to report telemetry to OKO API: %s %s",
        response.status,
        response.statusText,
      );
    }
  } catch (error) {
    logger.error("Error reporting telemetry: %s", error);
  }
}
