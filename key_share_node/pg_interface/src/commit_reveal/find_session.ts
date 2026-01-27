import type { Pool, PoolClient } from "pg";
import type { Result } from "@oko-wallet/stdlib-js";
import type { CommitRevealSession } from "./types";

export async function findByIdTokenHash(
  db: Pool | PoolClient,
  hash: string,
): Promise<Result<CommitRevealSession | null, string>> {
  try {
    const query = `
SELECT * FROM "2_commit_reveal_sessions"
WHERE id_token_hash = $1
LIMIT 1
`;
    const result = await db.query(query, [hash]);
    const row = result.rows[0];
    if (!row) {
      return { success: true, data: null };
    }

    return { success: true, data: row as CommitRevealSession };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}

export async function findBySessionId(
  db: Pool | PoolClient,
  sessionId: string,
): Promise<Result<CommitRevealSession | null, string>> {
  try {
    const query = `
SELECT * FROM "2_commit_reveal_sessions"
WHERE session_id = $1
LIMIT 1
`;
    const result = await db.query(query, [sessionId]);
    const row = result.rows[0];
    if (!row) {
      return { success: true, data: null };
    }

    return { success: true, data: row as CommitRevealSession };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}
