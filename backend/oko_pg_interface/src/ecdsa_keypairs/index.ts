/**
 * Database Repository for ECDSA Keypairs
 * Handles CRUD operations for oko_server_ecdsa_keypairs table
 */

import type { Pool, PoolClient } from "pg";
import type { Result } from "@oko-wallet/stdlib-js";
import { Bytes, type Bytes32, type Bytes33 } from "@oko-wallet/bytes";

export interface ECDSAKeypairRow {
  id: number;
  private_key: string; // Encrypted (format: iv:authTag:ciphertext)
  public_key: string; // Hex-encoded (66 chars)
  active: boolean;
  created_at: Date;
  rotated_at: Date | null;
}

export interface ECDSAKeypairDecrypted {
  id: number;
  privateKey: Bytes32; // Decrypted private key
  publicKey: Bytes33; // Compressed public key
  active: boolean;
  createdAt: Date;
  rotatedAt: Date | null;
}

export interface ECDSAKeypairPublic {
  id: number;
  publicKey: Bytes33;
  active: boolean;
  createdAt: Date;
  rotatedAt: Date | null;
}

/**
 * Insert a new ECDSA keypair into the database
 * @param db - PostgreSQL connection pool or client
 * @param privateKey - Hex-encoded private key (will be encrypted)
 * @param publicKey - Compressed public key (33 bytes)
 * @param encryptionKey - Key to encrypt the private key
 * @returns Result with inserted keypair ID
 */
export async function insertECDSAKeypair(
  db: Pool | PoolClient,
  encryptedPrivateKey: string,
  publicKey: Bytes33,
): Promise<Result<number, string>> {
  try {
    const query = `
      INSERT INTO oko_server_ecdsa_keypairs (private_key, public_key, active)
      VALUES ($1, $2, true)
      RETURNING id
    `;

    const result = await db.query(query, [
      encryptedPrivateKey,
      publicKey.toHex(),
    ]);

    if (result.rows.length === 0) {
      return { success: false, err: "Failed to insert ECDSA keypair" };
    }

    const id = result.rows[0].id as number;

    return { success: true, data: id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      err: `Failed to insert ECDSA keypair: ${errorMessage}`,
    };
  }
}

/**
 * Get the active ECDSA keypair (encrypted)
 * @param db - PostgreSQL connection pool or client
 * @returns Result with active keypair (encrypted private key)
 */
export async function getActiveECDSAKeypair(
  db: Pool | PoolClient,
): Promise<Result<ECDSAKeypairRow | null, string>> {
  try {
    const query = `
      SELECT id, private_key, public_key, active, created_at, rotated_at
      FROM oko_server_ecdsa_keypairs
      WHERE active = true
      LIMIT 1
    `;

    const result = await db.query(query);

    if (result.rows.length === 0) {
      return { success: true, data: null };
    }

    const row = result.rows[0] as ECDSAKeypairRow;

    return {
      success: true,
      data: row,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      err: `Failed to get active ECDSA keypair: ${errorMessage}`,
    };
  }
}

/**
 * Get ECDSA keypair by public key (encrypted)
 * @param db - PostgreSQL connection pool or client
 * @param publicKey - Compressed public key (33 bytes)
 * @returns Result with keypair (encrypted) or null if not found
 */
export async function getECDSAKeypairByPublicKey(
  db: Pool | PoolClient,
  publicKey: Bytes33,
): Promise<Result<ECDSAKeypairRow | null, string>> {
  try {
    const query = `
      SELECT id, private_key, public_key, active, created_at, rotated_at
      FROM oko_server_ecdsa_keypairs
      WHERE public_key = $1
      LIMIT 1
    `;

    const result = await db.query(query, [publicKey.toHex()]);

    if (result.rows.length === 0) {
      return { success: true, data: null };
    }

    const row = result.rows[0] as ECDSAKeypairRow;

    return {
      success: true,
      data: row,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      err: `Failed to get ECDSA keypair by public key: ${errorMessage}`,
    };
  }
}

/**
 * Deactivate old active keypair and activate new one (key rotation)
 * @param db - PostgreSQL connection pool
 * @param oldKeypairId - ID of old keypair to deactivate
 * @param newKeypairId - ID of new keypair to activate
 * @returns Result indicating success or failure
 */
export async function rotateECDSAKeypair(
  db: Pool,
  oldKeypairId: number,
  newKeypairId: number,
): Promise<Result<void, string>> {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Deactivate old keypair
    await client.query(
      `UPDATE oko_server_ecdsa_keypairs
       SET active = false, rotated_at = NOW()
       WHERE id = $1`,
      [oldKeypairId],
    );

    // Activate new keypair
    await client.query(
      `UPDATE oko_server_ecdsa_keypairs
       SET active = true
       WHERE id = $1`,
      [newKeypairId],
    );

    await client.query("COMMIT");

    return { success: true, data: undefined };
  } catch (error) {
    await client.query("ROLLBACK");
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      err: `Failed to rotate ECDSA keypair: ${errorMessage}`,
    };
  } finally {
    client.release();
  }
}

/**
 * List all ECDSA keypairs (without private keys)
 * @param db - PostgreSQL connection pool or client
 * @returns Result with list of keypairs (public info only)
 */
export async function listECDSAKeypairs(
  db: Pool | PoolClient,
): Promise<Result<Array<ECDSAKeypairPublic>, string>> {
  try {
    const query = `
      SELECT id, public_key, active, created_at, rotated_at
      FROM oko_server_ecdsa_keypairs
      ORDER BY created_at DESC
    `;

    const result = await db.query(query);

    const keypairs: Array<ECDSAKeypairPublic> = [];

    for (const row of result.rows) {
      const publicKeyResult = Bytes.fromHexString(row.public_key, 33);
      if (!publicKeyResult.success) {
        return {
          success: false,
          err: `Failed to parse public key: ${publicKeyResult.err}`,
        };
      }

      keypairs.push({
        id: row.id,
        publicKey: publicKeyResult.data as Bytes33,
        active: row.active,
        createdAt: row.created_at,
        rotatedAt: row.rotated_at,
      });
    }

    return { success: true, data: keypairs };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      err: `Failed to list ECDSA keypairs: ${errorMessage}`,
    };
  }
}
