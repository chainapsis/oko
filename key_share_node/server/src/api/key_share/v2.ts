import type { Pool, PoolClient } from "pg";
import {
  createUser,
  getUserByAuthTypeAndUserAuthId,
} from "@oko-wallet/ksn-pg-interface";
import type {
  CheckKeyShareV2Request,
  CheckKeyShareV2Response,
  GetKeyShareV2Request,
  GetKeyShareV2Response,
  RegisterKeyShareV2Request,
} from "@oko-wallet/ksn-interface/key_share";
import type { KSNodeApiResponse } from "@oko-wallet/ksn-interface/response";

import { logger } from "@oko-wallet-ksn-server/logger";
import {
  checkWalletKeyShare,
  getWalletKeyShare,
  registerWalletKeyShare,
} from "./helper";

/**
 * Get multiple key shares at once (v2)
 *
 * Unlike v1, this endpoint accepts wallets as an object { secp256k1?: pk, ed25519?: pk }
 * and returns key shares in the same structure.
 * All requested wallets must exist and belong to the authenticated user.
 */
export async function getKeyShareV2(
  db: Pool | PoolClient,
  request: GetKeyShareV2Request,
  encryptionSecret: string,
): Promise<KSNodeApiResponse<GetKeyShareV2Response>> {
  try {
    const { user_auth_id, auth_type, wallets } = request;

    const getUserRes = await getUserByAuthTypeAndUserAuthId(
      db,
      auth_type,
      user_auth_id,
    );
    if (getUserRes.success === false) {
      return {
        success: false,
        code: "USER_NOT_FOUND",
        msg: `Failed to get key share by user`,
      };
    }

    if (getUserRes.data === null) {
      return {
        success: false,
        code: "USER_NOT_FOUND",
        msg: `User not found: ${user_auth_id} (auth_type: ${auth_type})`,
      };
    }

    const userId = getUserRes.data.user_id;

    const [secp256k1Res, ed25519Res] = await Promise.all([
      wallets.secp256k1
        ? getWalletKeyShare(
            db,
            wallets.secp256k1,
            userId,
            "secp256k1",
            encryptionSecret,
          )
        : null,
      wallets.ed25519
        ? getWalletKeyShare(
            db,
            wallets.ed25519,
            userId,
            "ed25519",
            encryptionSecret,
          )
        : null,
    ]);

    if (secp256k1Res?.success === false) return secp256k1Res;
    if (ed25519Res?.success === false) return ed25519Res;

    const result: GetKeyShareV2Response = {};
    if (secp256k1Res) result.secp256k1 = secp256k1Res.data;
    if (ed25519Res) result.ed25519 = ed25519Res.data;

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    logger.error("Failed to get key shares: %s", error);
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: "Failed to get key shares",
    };
  }
}

/**
 * Check existence of multiple key shares at once (v2)
 *
 * Unlike v1, this endpoint accepts wallets as an object { secp256k1?: pk, ed25519?: pk }
 * and returns existence status in the same structure.
 * No authentication required (same as v1).
 */
export async function checkKeyShareV2(
  db: Pool | PoolClient,
  request: CheckKeyShareV2Request,
): Promise<KSNodeApiResponse<CheckKeyShareV2Response>> {
  try {
    const { user_auth_id, auth_type, wallets } = request;

    const getUserRes = await getUserByAuthTypeAndUserAuthId(
      db,
      auth_type,
      user_auth_id,
    );
    if (getUserRes.success === false) {
      return {
        success: false,
        code: "USER_NOT_FOUND",
        msg: `Failed to check key share existence`,
      };
    }

    // User not found = all wallets don't exist
    if (getUserRes.data === null) {
      const result: CheckKeyShareV2Response = {};
      if (wallets.secp256k1) result.secp256k1 = { exists: false };
      if (wallets.ed25519) result.ed25519 = { exists: false };
      return { success: true, data: result };
    }

    const userId = getUserRes.data.user_id;

    const [secp256k1Res, ed25519Res] = await Promise.all([
      wallets.secp256k1
        ? checkWalletKeyShare(db, wallets.secp256k1, userId)
        : null,
      wallets.ed25519 ? checkWalletKeyShare(db, wallets.ed25519, userId) : null,
    ]);

    if (secp256k1Res && "error" in secp256k1Res) {
      return {
        success: false,
        code: "PUBLIC_KEY_INVALID",
        msg: secp256k1Res.error,
      };
    }
    if (ed25519Res && "error" in ed25519Res) {
      return {
        success: false,
        code: "PUBLIC_KEY_INVALID",
        msg: ed25519Res.error,
      };
    }

    const result: CheckKeyShareV2Response = {};
    if (secp256k1Res) result.secp256k1 = secp256k1Res;
    if (ed25519Res) result.ed25519 = ed25519Res;

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    logger.error("Failed to check key shares: %s", error);
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: "Failed to check key shares",
    };
  }
}

/**
 * Register multiple key shares at once (v2)
 *
 * Unlike v1, this endpoint accepts wallets as an object { secp256k1?: {...}, ed25519?: {...} }
 * Each wallet contains public_key and share.
 * All wallets are registered atomically within a single transaction.
 */
export async function registerKeyShareV2(
  db: Pool,
  request: RegisterKeyShareV2Request,
  encryptionSecret: string,
): Promise<KSNodeApiResponse<void>> {
  const { user_auth_id, auth_type, wallets } = request;

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Get or create user
    const getUserRes = await getUserByAuthTypeAndUserAuthId(
      client,
      auth_type,
      user_auth_id,
    );
    if (getUserRes.success === false) {
      throw new Error(`Failed to getUserByAuthTypeAndUserAuthId: ${getUserRes.err}`);
    }

    let userId: string;
    if (getUserRes.data === null) {
      const createUserRes = await createUser(client, auth_type, user_auth_id);
      if (createUserRes.success === false) {
        throw new Error(`Failed to createUser: ${createUserRes.err}`);
      }
      userId = createUserRes.data.user_id;
    } else {
      userId = getUserRes.data.user_id;
    }

    // Register each wallet sequentially within the transaction
    if (wallets.secp256k1) {
      const res = await registerWalletKeyShare(
        client,
        wallets.secp256k1,
        userId,
        "secp256k1",
        encryptionSecret,
      );
      if (res.success === false) {
        await client.query("ROLLBACK");
        return res;
      }
    }

    if (wallets.ed25519) {
      const res = await registerWalletKeyShare(
        client,
        wallets.ed25519,
        userId,
        "ed25519",
        encryptionSecret,
      );
      if (res.success === false) {
        await client.query("ROLLBACK");
        return res;
      }
    }

    await client.query("COMMIT");
    return { success: true, data: void 0 };
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error("Failed to register key shares: %s", error);
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: "Failed to register key shares",
    };
  } finally {
    client.release();
  }
}
