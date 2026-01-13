import type { Pool, PoolClient } from "pg";
import {
  createKeyShare,
  createUser,
  createWallet,
  getKeyShareByWalletId,
  getUserByAuthTypeAndUserAuthId,
  getWalletByPublicKey,
  updateReshare,
} from "@oko-wallet/ksn-pg-interface";
import type {
  CheckKeyShareRequest,
  CheckKeyShareResponse,
  CheckKeyShareV2Request,
  CheckKeyShareV2Response,
  GetKeyShareRequest,
  GetKeyShareResponse,
  GetKeyShareV2Request,
  GetKeyShareV2Response,
  RegisterKeyShareRequest,
  ReshareKeyShareRequest,
} from "@oko-wallet/ksn-interface/key_share";
import type { CurveType } from "@oko-wallet/ksn-interface/curve_type";
import type { KSNodeApiResponse } from "@oko-wallet/ksn-interface/response";

import {
  decryptDataAsync,
  encryptDataAsync,
} from "@oko-wallet-ksn-server/encrypt";

export async function registerKeyShare(
  db: Pool,
  registerKeyShareRequest: RegisterKeyShareRequest,
  encryptionSecret: string,
): Promise<KSNodeApiResponse<void>> {
  try {
    const { user_auth_id, auth_type, curve_type, public_key, share } =
      registerKeyShareRequest;

    if (curve_type !== "secp256k1" && curve_type !== "ed25519") {
      return {
        success: false,
        code: "CURVE_TYPE_NOT_SUPPORTED",
        msg: `Curve type not supported: ${curve_type}`,
      };
    }

    const getWalletRes = await getWalletByPublicKey(db, public_key);
    if (getWalletRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to getWalletByPublicKey: ${getWalletRes.err}`,
      };
    }

    if (getWalletRes.data !== null) {
      return {
        success: false,
        code: "DUPLICATE_PUBLIC_KEY",
        msg: `Duplicate public key: ${public_key.toHex()}`,
      };
    }

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

    const client = await db.connect();
    try {
      await client.query("BEGIN");

      let user_id: string;
      if (getUserRes.data === null) {
        const createUserRes = await createUser(client, auth_type, user_auth_id);
        if (createUserRes.success === false) {
          throw new Error(`Failed to createUser: ${createUserRes.err}`);
        }

        user_id = createUserRes.data.user_id;
      } else {
        user_id = getUserRes.data.user_id;
      }

      const createWalletRes = await createWallet(client, {
        user_id,
        curve_type,
        public_key: public_key.toUint8Array(),
      });
      if (createWalletRes.success === false) {
        throw new Error(`Failed to createWallet: ${createWalletRes.err}`);
      }

      const wallet_id = createWalletRes.data.wallet_id;

      const encryptedShare = await encryptDataAsync(
        share.toHex(),
        encryptionSecret,
      );
      const encryptedShareBuffer = Buffer.from(encryptedShare, "utf-8");

      const createKeyShareRes = await createKeyShare(client, {
        wallet_id,
        enc_share: encryptedShareBuffer,
      });
      if (createKeyShareRes.success === false) {
        throw new Error(`Failed to createKeyShare: ${createKeyShareRes.err}`);
      }

      await client.query("COMMIT");
      return { success: true, data: void 0 };
    } catch (error) {
      await client.query("ROLLBACK");
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: String(error),
      };
    } finally {
      client.release();
    }
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: String(error),
    };
  }
}

export async function getKeyShare(
  db: Pool | PoolClient,
  getKeyShareRequest: GetKeyShareRequest,
  encryptionSecret: string,
): Promise<KSNodeApiResponse<GetKeyShareResponse>> {
  try {
    const { user_auth_id, auth_type, public_key } = getKeyShareRequest;

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

    const getWalletRes = await getWalletByPublicKey(db, public_key);
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
        msg: `Wallet not found: ${public_key.toHex()}`,
      };
    }
    if (getWalletRes.data.user_id !== getUserRes.data.user_id) {
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
        msg: "Key share not found",
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
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: String(error),
    };
  }
}

export async function reshareKeyShare(
  db: Pool | PoolClient,
  reshareKeyShareRequest: ReshareKeyShareRequest,
  encryptionSecret: string,
): Promise<KSNodeApiResponse<void>> {
  try {
    const { user_auth_id, auth_type, curve_type, public_key, share } =
      reshareKeyShareRequest;

    if (curve_type !== "secp256k1" && curve_type !== "ed25519") {
      return {
        success: false,
        code: "CURVE_TYPE_NOT_SUPPORTED",
        msg: `Curve type not supported: ${curve_type}`,
      };
    }

    const getWalletRes = await getWalletByPublicKey(db, public_key);
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
        msg: `Wallet not found: ${public_key.toHex()}`,
      };
    }

    let wallet_id = getWalletRes.data.wallet_id;

    // Get user to verify ownership
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

    // Verify wallet belongs to user
    if (getWalletRes.data.user_id !== getUserRes.data.user_id) {
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
        msg: "Key share not found",
      };
    }

    // Validate that the new share matches the existing share
    const existingDecryptedShare = await decryptDataAsync(
      getKeyShareRes.data.enc_share.toString("utf-8"),
      encryptionSecret,
    );
    if (existingDecryptedShare.toLowerCase() !== share.toHex().toLowerCase()) {
      return {
        success: false,
        code: "RESHARE_FAILED",
        msg: "New share does not match existing share",
      };
    }

    const updateKeyShareRes = await updateReshare(db, wallet_id);
    if (updateKeyShareRes.success === false) {
      return {
        success: false,
        code: "RESHARE_FAILED",
        msg: `Failed to updateReshare: ${updateKeyShareRes.err}`,
      };
    }

    return { success: true, data: void 0 };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: String(error),
    };
  }
}

export async function checkKeyShare(
  db: Pool | PoolClient,
  checkKeyShareRequest: CheckKeyShareRequest,
): Promise<KSNodeApiResponse<CheckKeyShareResponse>> {
  try {
    const { user_auth_id, auth_type, public_key } = checkKeyShareRequest;

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
        success: true,
        data: {
          exists: false,
        },
      };
    }

    const getWalletRes = await getWalletByPublicKey(db, public_key);
    if (getWalletRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to getWalletByPublicKey: ${getWalletRes.err}`,
      };
    }
    if (getWalletRes.data === null) {
      return {
        success: true,
        data: {
          exists: false,
        },
      };
    }
    if (getWalletRes.data.user_id !== getUserRes.data.user_id) {
      return {
        success: false,
        code: "PUBLIC_KEY_INVALID",
        msg: "Public key is not valid",
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
        success: true,
        data: {
          exists: false,
        },
      };
    }

    return {
      success: true,
      data: {
        exists: true,
      },
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: String(error),
    };
  }
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

    // 1. Get user
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

    // Helper function to process a single wallet
    async function processWallet(
      publicKey: Parameters<typeof getWalletByPublicKey>[1],
      curveType: CurveType,
    ): Promise<KSNodeApiResponse<GetKeyShareV2Response[typeof curveType]>> {
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

    // 2. Process secp256k1
    if (wallets.secp256k1) {
      const res = await processWallet(wallets.secp256k1, "secp256k1");
      if (res.success === false) {
        return res;
      }
      result.secp256k1 = res.data;
    }

    // 3. Process ed25519
    if (wallets.ed25519) {
      const res = await processWallet(wallets.ed25519, "ed25519");
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

    // 1. Get user
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

    // Helper function to check a single wallet
    async function checkWallet(
      publicKey: Parameters<typeof getWalletByPublicKey>[1],
    ): Promise<{ exists: boolean } | { error: string }> {
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

    // 2. Check secp256k1
    if (wallets.secp256k1) {
      const res = await checkWallet(wallets.secp256k1);
      if ("error" in res) {
        return {
          success: false,
          code: "PUBLIC_KEY_INVALID",
          msg: res.error,
        };
      }
      result.secp256k1 = res;
    }

    // 3. Check ed25519
    if (wallets.ed25519) {
      const res = await checkWallet(wallets.ed25519);
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
