import type { Pool, PoolClient } from "pg";
import type { KSNodeUser } from "@oko-wallet/ksn-interface/user";
import type { AuthType } from "@oko-wallet/oko-types/auth";
import type { Result } from "@oko-wallet/stdlib-js";

export async function createUser(
  db: Pool | PoolClient,
  user_auth_id: string,
  auth_type: AuthType,
): Promise<Result<KSNodeUser, string>> {
  try {
    const query = `
INSERT INTO "2_users" (
  user_auth_id, auth_type
) 
VALUES (
  $1, $2
) 
RETURNING *
`;

    const values = [user_auth_id, auth_type];

    const result = await db.query(query, values);

    const row = result.rows[0];
    if (!row) {
      return { success: false, err: "Failed to create user" };
    }

    return { success: true, data: row as KSNodeUser };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}

export async function getUserByUserAuthIdAndAuthType(
  db: Pool | PoolClient,
  user_auth_id: string,
  auth_type: AuthType,
): Promise<Result<KSNodeUser | null, string>> {
  try {
    const query = `
SELECT * FROM "2_users" 
WHERE user_auth_id = $1 AND auth_type = $2
LIMIT 1
`;
    const result = await db.query(query, [user_auth_id, auth_type]);

    const row = result.rows[0];
    if (!row) {
      return { success: true, data: null };
    }

    return { success: true, data: row as KSNodeUser };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}

export async function getUserFromUserId(
  db: Pool | PoolClient,
  user_id: string,
): Promise<Result<KSNodeUser, string>> {
  try {
    const query = `
SELECT * FROM "2_users" 
WHERE user_id = $1 
LIMIT 1
`;
    const result = await db.query(query, [user_id]);

    const row = result.rows[0];
    if (!row) {
      return { success: false, err: "User not found" };
    }

    return { success: true, data: row as KSNodeUser };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}
