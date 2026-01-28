import type { Pool, PoolClient } from "pg";
import type { Result } from "@oko-wallet/stdlib-js";
import type { CommitRevealSession, CreateSessionParams } from "@oko-wallet/ksn-interface/commit_reveal";

export async function createSession(
  db: Pool | PoolClient,
  params: CreateSessionParams,
): Promise<Result<CommitRevealSession, string>> {
  try {
    const query = `
INSERT INTO "2_commit_reveal_sessions" (
  session_id, operation_type, client_ephemeral_pubkey,
  id_token_hash, expires_at
)
VALUES ($1, $2, $3, $4, $5)
RETURNING *
`;
    const values = [
      params.session_id,
      params.operation_type,
      params.client_ephemeral_pubkey,
      params.id_token_hash,
      params.expires_at,
    ];

    const result = await db.query(query, values);
    const row = result.rows[0];
    if (!row) {
      return { success: false, err: "Failed to create session" };
    }

    return { success: true, data: row as CommitRevealSession };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}
