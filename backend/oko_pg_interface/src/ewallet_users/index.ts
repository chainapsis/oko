import type { Pool, PoolClient } from "pg";
import { v4 as uuidv4 } from "uuid";
import type { Result } from "@oko-wallet/stdlib-js";
import type { User } from "@oko-wallet/oko-types/user";

export async function createUser(
  db: Pool,
  email: string,
): Promise<Result<User, string>> {
  try {
    const query = `
INSERT INTO ewallet_users (
  user_id, email
) VALUES (
  $1, $2
) 
RETURNING *
`;
    const values = [uuidv4(), email.toLowerCase()];

    const result = await db.query<User>(query, values);

    const row = result.rows[0];
    if (!row) {
      return {
        success: false,
        err: "Failed to create user",
      };
    }

    return {
      success: true,
      data: row,
    };
  } catch (error) {
    return {
      success: false,
      err: String(error),
    };
  }
}

export async function getUserByEmail(
  db: Pool | PoolClient,
  email: string,
): Promise<Result<User | null, string>> {
  try {
    const query = `
SELECT * 
FROM ewallet_users 
WHERE email = $1 
LIMIT 1
`;

    const result = await db.query(query, [email.toLowerCase()]);

    let user: User | null = null;
    if (result.rows.length > 0) {
      user = result.rows[0] as User;
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    return {
      success: false,
      err: String(error),
    };
  }
}
