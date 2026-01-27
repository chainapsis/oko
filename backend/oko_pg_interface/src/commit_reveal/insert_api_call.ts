import type { Pool, PoolClient } from "pg";
import type { Result } from "@oko-wallet/stdlib-js";

export async function recordApiCall(
  db: Pool | PoolClient,
  sessionId: string,
  apiName: string,
): Promise<Result<void, string>> {
  try {
    const query = `
INSERT INTO "commit_reveal_api_calls" (session_id, api_name)
VALUES ($1, $2)
`;
    await db.query(query, [sessionId, apiName]);

    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}
