import type { Pool } from "pg";
import type { Result } from "@oko-wallet/stdlib-js";
import {
  insertKSNodeTelemetry,
  getLastKSNodeTelemetry,
  getKSNodeByTelemetryId,
} from "@oko-wallet/oko-pg-interface/ks_nodes";

import { sendSlackAlert } from "@oko-wallet-tss-api/utils/slack";

export interface KSNodeTelemetryPayload {
  telemetry_node_id: string;
  key_share_count: number;
  payload: any;
}

export async function processKSNodeTelemetry(
  db: Pool,
  input: KSNodeTelemetryPayload,
  password: string,
): Promise<Result<void, string>> {
  // 1. Verify Password
  if (password !== process.env.KS_NODE_REPORT_PASSWORD) {
    return {
      success: false,
      err: "Invalid password",
    };
  }

  const { telemetry_node_id, key_share_count, payload } = input;

  // 2. Get previous telemetry for comparison
  const lastTelemetryRes = await getLastKSNodeTelemetry(db, telemetry_node_id);
  if (!lastTelemetryRes.success) {
    await sendSlackAlert(
      `[TSS API Error] Failed to get last telemetry for node ${telemetry_node_id}: ${lastTelemetryRes.err}`,
    );
    return { success: false, err: lastTelemetryRes.err };
  }

  const lastTelemetry = lastTelemetryRes.data;

  // 3. Insert new telemetry
  const insertRes = await insertKSNodeTelemetry(
    db,
    telemetry_node_id,
    key_share_count,
    payload,
  );
  if (!insertRes.success) {
    await sendSlackAlert(
      `[TSS API Error] Failed to insert telemetry for node ${telemetry_node_id}: ${insertRes.err}`,
    );
    return { success: false, err: insertRes.err };
  }

  // 4. Check for anomalies
  const nodeRes = await getKSNodeByTelemetryId(db, telemetry_node_id);
  const nodeName =
    nodeRes.success && nodeRes.data
      ? `${nodeRes.data.node_name} (${telemetry_node_id})`
      : telemetry_node_id;

  if (key_share_count === 0) {
    await sendSlackAlert(
      `[KS Node Alert] Key share count is 0 for node: ${nodeName}`,
    );
  } else if (lastTelemetry && key_share_count < lastTelemetry.key_share_count) {
    await sendSlackAlert(
      `[KS Node Alert] Key share count decreased for node: ${nodeName}. Previous: ${lastTelemetry.key_share_count}, Current: ${key_share_count}`,
    );
  }

  return { success: true, data: void 0 };
}
