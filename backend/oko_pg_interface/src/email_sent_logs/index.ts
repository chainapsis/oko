import { Pool, type PoolClient } from "pg";
import type { Result } from "@oko-wallet/stdlib-js";
import { type InsertEmailSentLogRequest } from "@oko-wallet/oko-types/ct_dashboard";

export async function insertEmailSentLog(
  db: Pool | PoolClient,
  request: InsertEmailSentLogRequest,
): Promise<Result<void, string>> {
  const query = `
INSERT INTO email_sent_logs (
  target_id, type, email
)
VALUES (
  $1, $2, $3
)
`;

  try {
    await db.query(query, [request.target_id, request.type, request.email]);
    return { success: true, data: void 0 };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}
