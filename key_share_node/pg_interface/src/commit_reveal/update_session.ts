import type { Pool, PoolClient } from "pg";
import type { Result } from "@oko-wallet/stdlib-js";
import type { SessionState } from "@oko-wallet/ksn-interface/commit_reveal";

export async function updateState(
  db: Pool | PoolClient,
  sessionId: string,
  state: SessionState,
): Promise<Result<void, string>> {
  try {
    const query = `
UPDATE "2_commit_reveal_sessions"
SET state = $2
WHERE session_id = $1
`;
    await db.query(query, [sessionId, state]);

    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}
