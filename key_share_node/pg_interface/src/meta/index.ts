import type { Pool, PoolClient } from "pg";
import { v4 as uuidv4 } from "uuid";
import type { Result } from "@oko-wallet/stdlib-js";

export interface NodeMeta {
  meta_id: string;
  analytics_id: string;
  created_at: Date;
  updated_at: Date;
}

export async function getTelemetryId(
  db: Pool | PoolClient,
): Promise<Result<string | null, string>> {
  try {
    const query = `
SELECT telemetry_node_id FROM "meta"
LIMIT 1
`;
    const result = await db.query<{ telemetry_node_id: string }>(query);

    const row = result.rows[0];
    if (!row) {
      return { success: true, data: null };
    }

    return { success: true, data: row.telemetry_node_id };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}

export async function setTelemetryId(
  db: Pool | PoolClient,
  telemetryNodeId: string,
): Promise<Result<void, string>> {
  try {
    const query = `
INSERT INTO "meta" (
  meta_id, telemetry_node_id
)
VALUES (
  $1, $2
)
`;
    await db.query(query, [uuidv4(), telemetryNodeId]);

    return { success: true, data: void 0 };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}
