import type { Pool, PoolClient } from "pg";
import type { Result } from "@oko-wallet/stdlib-js";

export async function hasApiBeenCalled(
  db: Pool | PoolClient,
  sessionId: string,
  apiName: string,
): Promise<Result<boolean, string>> {
  try {
    const query = `
SELECT 1 FROM "2_commit_reveal_api_calls"
WHERE session_id = $1 AND api_name = $2
LIMIT 1
`;
    const result = await db.query(query, [sessionId, apiName]);

    return { success: true, data: result.rows.length > 0 };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}
