import type { Pool, PoolClient } from "pg";
import {
  getKeyShareByWalletId,
  getUserByAuthTypeAndUserAuthId,
  getWalletByPublicKey,
} from "@oko-wallet/ksn-pg-interface";
import type {
  CheckKeyShareV2Request,
  CheckKeyShareV2Response,
  GetKeyShareV2Request,
  GetKeyShareV2Response,
} from "@oko-wallet/ksn-interface/key_share";
import type { CurveType } from "@oko-wallet/ksn-interface/curve_type";
import type { KSNodeApiResponse } from "@oko-wallet/ksn-interface/response";

import { decryptDataAsync } from "@oko-wallet-ksn-server/encrypt";

// ============================================================================
// Helper Types & Functions
// ============================================================================

type PublicKeyBytes = Parameters<typeof getWalletByPublicKey>[1];

type GetWalletResult = {
  share_id: string;
  share: string;
};

async function getWalletKeyShare(
  db: Pool | PoolClient,
  publicKey: PublicKeyBytes,
  userId: string,
  curveType: CurveType,
  encryptionSecret: string,
): Promise<KSNodeApiResponse<GetWalletResult>> {
  const getWalletRes = await getWalletByPublicKey(db, publicKey);
  if (getWalletRes.success === false) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to getWalletByPublicKey: ${getWalletRes.err}`,
    };
  }

  if (getWalletRes.data === null) {
    return {
      success: false,
      code: "WALLET_NOT_FOUND",
      msg: `Wallet not found for curve_type: ${curveType}`,
    };
  }

  if (getWalletRes.data.user_id !== userId) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      msg: "Unauthorized: wallet belongs to different user",
    };
  }

  const getKeyShareRes = await getKeyShareByWalletId(
    db,
    getWalletRes.data.wallet_id,
  );
  if (getKeyShareRes.success === false) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to getKeyShareByWalletId: ${getKeyShareRes.err}`,
    };
  }

  if (getKeyShareRes.data === null) {
    return {
      success: false,
      code: "KEY_SHARE_NOT_FOUND",
      msg: `Key share not found for curve_type: ${curveType}`,
    };
  }

  const decryptedShare = await decryptDataAsync(
    getKeyShareRes.data.enc_share.toString("utf-8"),
    encryptionSecret,
  );

  return {
    success: true,
    data: {
      share_id: getKeyShareRes.data.share_id,
      share: decryptedShare,
    },
  };
}

type CheckWalletResult = { exists: boolean } | { error: string };

async function checkWalletKeyShare(
  db: Pool | PoolClient,
  publicKey: PublicKeyBytes,
  userId: string,
): Promise<CheckWalletResult> {
  const getWalletRes = await getWalletByPublicKey(db, publicKey);
  if (getWalletRes.success === false) {
    return { error: `Failed to getWalletByPublicKey: ${getWalletRes.err}` };
  }

  if (getWalletRes.data === null) {
    return { exists: false };
  }

  if (getWalletRes.data.user_id !== userId) {
    return { error: "Public key is not valid" };
  }

  const getKeyShareRes = await getKeyShareByWalletId(
    db,
    getWalletRes.data.wallet_id,
  );
  if (getKeyShareRes.success === false) {
    return { error: `Failed to getKeyShareByWalletId: ${getKeyShareRes.err}` };
  }

  return { exists: getKeyShareRes.data !== null };
}

// ============================================================================
// v2 API Handlers
// ============================================================================

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
