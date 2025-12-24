import {
  getTelemetryId,
  setTelemetryId,
  countKeyShares,
} from "@oko-wallet/ksn-pg-interface";
import { v4 as uuidv4 } from "uuid";
import type { Pool } from "pg";

import { logger } from "@oko-wallet-ksn-server/logger";

export async function startTelemetryReporterRuntime(
  db: Pool,
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
      await reportTelemetry(db, okoApiBaseUrl, reportPassword);
    } catch (err) {
      logger.error("Telemetry reporter runtime error: %s", err);
    }
  };

  // Initial run
  run();

  setInterval(run, intervalSeconds * 1000);
}

async function reportTelemetry(db: Pool, baseUrl: string, password: string) {
  // 1. Get or Create Telemetry ID
  let telemetryIdRes = await getTelemetryId(db);
  if (!telemetryIdRes.success) {
    logger.error("Failed to get telemetry ID: %s", telemetryIdRes.err);
    return;
  }

  let telemetryNodeId = telemetryIdRes.data;
  if (!telemetryNodeId) {
    telemetryNodeId = uuidv4();
    logger.info("Generating new telemetry ID: %s", telemetryNodeId);
    const setRes = await setTelemetryId(db, telemetryNodeId);
    if (!setRes.success) {
      logger.error("Failed to set telemetry ID: %s", setRes.err);
      return;
    }
  }

  // 2. Count Key Shares
  const countRes = await countKeyShares(db);
  const keyShareCount = countRes.success ? countRes.data : -1;
  const payload = {
    db_status: countRes.success ? "OK" : "ERROR",
    error_msg: countRes.success ? null : countRes.err,
  };

  // 3. Send Report
  const url = `${baseUrl}/tss/v1/ks_node/telemetry`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-KS-NODE-PASSWORD": password,
      },
      body: JSON.stringify({
        telemetry_node_id: telemetryNodeId,
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
