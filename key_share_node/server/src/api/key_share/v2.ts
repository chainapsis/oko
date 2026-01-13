import type { Pool, PoolClient } from "pg";
import { getUserByAuthTypeAndUserAuthId } from "@oko-wallet/ksn-pg-interface";
import type {
  CheckKeyShareV2Request,
  CheckKeyShareV2Response,
  GetKeyShareV2Request,
  GetKeyShareV2Response,
} from "@oko-wallet/ksn-interface/key_share";
import type { KSNodeApiResponse } from "@oko-wallet/ksn-interface/response";

import { checkWalletKeyShare, getWalletKeyShare } from "./helper";

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
        code: "UNKNOWN_ERROR",
        msg: `Failed to getUserByAuthTypeAndUserAuthId: ${getUserRes.err}`,
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
    const result: GetKeyShareV2Response = {};

    if (wallets.secp256k1) {
      const res = await getWalletKeyShare(
        db,
        wallets.secp256k1,
        userId,
        "secp256k1",
        encryptionSecret,
      );
      if (res.success === false) {
        return res;
      }
      result.secp256k1 = res.data;
    }

    if (wallets.ed25519) {
      const res = await getWalletKeyShare(
        db,
        wallets.ed25519,
        userId,
        "ed25519",
        encryptionSecret,
      );
      if (res.success === false) {
        return res;
      }
      result.ed25519 = res.data;
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: String(error),
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
        code: "UNKNOWN_ERROR",
        msg: `Failed to getUserByAuthTypeAndUserAuthId: ${getUserRes.err}`,
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
    const result: CheckKeyShareV2Response = {};

    if (wallets.secp256k1) {
      const res = await checkWalletKeyShare(db, wallets.secp256k1, userId);
      if ("error" in res) {
        return {
          success: false,
          code: "PUBLIC_KEY_INVALID",
          msg: res.error,
        };
      }
      result.secp256k1 = res;
    }

    if (wallets.ed25519) {
      const res = await checkWalletKeyShare(db, wallets.ed25519, userId);
      if ("error" in res) {
        return {
          success: false,
          code: "PUBLIC_KEY_INVALID",
          msg: res.error,
        };
      }
      result.ed25519 = res;
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: String(error),
    };
  }
}
