import type { Pool, PoolClient } from "pg";
import type { Result } from "@oko-wallet/stdlib-js";

export async function recordApiCall(
  db: Pool | PoolClient,
  sessionId: string,
  apiName: string,
  signature: Uint8Array,
): Promise<Result<void, string>> {
  try {
    const query = `
INSERT INTO "2_commit_reveal_api_calls" (session_id, api_name, signature)
VALUES ($1, $2, $3)
`;
    await db.query(query, [sessionId, apiName, signature]);

    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}
